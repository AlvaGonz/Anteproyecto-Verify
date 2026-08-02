import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * 2FA Email Challenge — Verifier Spec (RF-2 / OE-2)
 *
 * These tests are the integration gate that proves:
 *   1. Clicking "Usar código por correo" REALLY triggers the backend email
 *      challenge send path (not just DB persistence). The UI click+render
 *      contract is asserted by the Vitest unit test on ChallengeScreen
 *      (see ChallengeScreen.test.tsx). This spec asserts the *backend
 *      pipeline* end-to-end through the public API + an observability hook.
 *   2. Resend respects throttle rules (no flood).
 *   3. No provider/internal technical detail ever leaks to the API consumer
 *      on failure.
 *   4. Swallowed Resend provider failures are detectable through the
 *      observability hook (`/api/dev/2fa-email-events`) and never look like
 *      success to the user.
 *   5. The project email template path is exercised
 *      (`2fa_email_template_rendered` lifecycle event).
 *   6. Full 2FA email code user flow passes end-to-end.
 *
 * Observability contract: the backend emits structured lifecycle events to an
 * in-process ring buffer exposed at `/api/dev/2fa-email-events?challengeToken=…`
 * in Development and Testing environments ONLY. The buffer contains NO OTP
 * value, NO email address, NO provider API key — only the event name,
 * ISO timestamp, and a redacted challenge-token hash, plus an optional
 * outcome tag.
 */

const API_URL = process.env.API_BASE_URL
  ? `${process.env.API_BASE_URL}/api`
  : 'http://localhost:5000/api';
const VALID_PASSWORD = 'Password123!';

// ── Helpers ────────────────────────────────────────────────────────────────

async function currentTotpForSecret(
  request: APIRequestContext,
  secret: string,
): Promise<string> {
  const r = await request.get(
    `${API_URL}/dev/current-totp?secret=${encodeURIComponent(secret)}`,
  );
  const body = await r.json();
  return body.code;
}

async function registerVerifyEnable(
  request: APIRequestContext,
  prefix: string,
): Promise<string> {
  const email = `2fa_${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 7)}@example.com`;
  await request.post(`${API_URL}/auth/register`, {
    data: {
      nombre: 'Email',
      apellidos: 'Tester',
      email,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    },
  });
  const dev = await request.get(
    `${API_URL}/dev/last-verification-token?email=${email}`,
  );
  const token = (await dev.json()).token;
  await request.get(`${API_URL}/auth/verify?token=${token}`);
  await request.post(`${API_URL}/auth/login`, {
    data: { email, password: VALID_PASSWORD },
  });
  const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
  const { secret } = await begin.json();
  const code = await currentTotpForSecret(request, secret);
  await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, {
    data: { code },
  });
  return email;
}

async function loginAndGetChallenge(
  request: APIRequestContext,
  email: string,
): Promise<string> {
  const login = await request.post(`${API_URL}/auth/login`, {
    data: { email, password: VALID_PASSWORD },
  });
  const { challengeToken } = await login.json();
  return challengeToken;
}

/** Lifecycle events observable for a given challenge (dev/testing only). */
interface LifecycleEvent {
  event:
    | '2fa_email_challenge_requested'
    | '2fa_email_template_rendered'
    | '2fa_email_provider_dispatch_started'
    | '2fa_email_provider_dispatch_succeeded'
    | '2fa_email_provider_dispatch_failed'
    | '2fa_email_resend_throttled';
  ts: string;
  challengeTokenHash: string;
  outcome?: 'success' | 'failure' | 'throttled';
}

async function fetchLifecycleEvents(
  request: APIRequestContext,
  challengeToken: string,
): Promise<LifecycleEvent[]> {
  const r = await request.get(
    `${API_URL}/dev/2fa-email-events?challengeToken=${encodeURIComponent(challengeToken)}`,
  );
  expect(r.ok(), `lifecycle endpoint returned ${r.status()}`).toBeTruthy();
  return (await r.json()) as LifecycleEvent[];
}

const INTERNAL_DETAIL_REGEX =
  /resend|provider|sdk|exception|\bstack\b|\bef\b|sql|\b500\b|Resend\.|Resend SDK/i;

// ── 1. Clicking "Usar código por correo" triggers the real send path ───────

test.describe('2FA Email Challenge — real dispatch', () => {
  test('request triggers provider dispatch through the template path', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'disp_ok');
    const challengeToken = await loginAndGetChallenge(request, email);

    const res = await request.post(`${API_URL}/auth/2fa/email-otp/request`, {
      data: { challengeToken },
    });
    expect(res.status(), 'request endpoint should succeed (200)').toBe(200);

    const events = await fetchLifecycleEvents(request, challengeToken);
    const names = events.map((e) => e.event);

    // The contract: clicking the button MUST start the real send path. The
    // presence of these lifecycle events proves the dispatch pipeline ran.
    expect(names).toContain('2fa_email_challenge_requested');
    expect(names).toContain('2fa_email_template_rendered');
    expect(names).toContain('2fa_email_provider_dispatch_started');
    expect(names).toContain('2fa_email_provider_dispatch_succeeded');

    // And — critically — there must be NO false success: a successful send
    // must be paired with a succeeded event, never a failed event.
    expect(names).not.toContain('2fa_email_provider_dispatch_failed');
  });
});

// ── 2. Resend respects cooldown ────────────────────────────────────────────

test.describe('2FA Email Challenge — throttle', () => {
  test('second request within cooldown is throttled with a safe message', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'disp_thr');
    const challengeToken = await loginAndGetChallenge(request, email);

    const first = await request.post(`${API_URL}/auth/2fa/email-otp/request`, {
      data: { challengeToken },
    });
    expect(first.status()).toBe(200);

    // Immediate second request must be rejected (throttled).
    const second = await request.post(
      `${API_URL}/auth/2fa/email-otp/request`,
      { data: { challengeToken } },
    );
    expect([400, 429]).toContain(second.status());

    const body = await second.json();
    // Safe UX message only; never includes provider names, internal codes, or
    // stack traces. We assert the safe catalog wording appears.
    const msg: string =
      body.message ?? body.Message ?? (body.error?.message ?? '');
    expect(msg.length, 'throttle message must be present').toBeGreaterThan(0);
    // MUST contain a "wait/again" hint in Spanish.
    expect(msg).toMatch(/esperar|momento|nuevamente|más tarde|intente/i);
    expect(
      msg,
      `throttle message leaked internal detail: '${msg}'`,
    ).not.toMatch(INTERNAL_DETAIL_REGEX);

    const events = await fetchLifecycleEvents(request, challengeToken);
    const names = events.map((e) => e.event);
    expect(
      names,
      'a throttled resend must emit a 2fa_email_resend_throttled lifecycle event',
    ).toContain('2fa_email_resend_throttled');
    // And dispatch must NOT have started again for the throttled attempt.
    const startedCount = names.filter(
      (n) => n === '2fa_email_provider_dispatch_started',
    ).length;
    expect(
      startedCount,
      'no dispatch should start for a throttled resend',
    ).toBe(1);
  });
});

// ── 3 & 4. Swallowed-request regression — provider failure cannot look like success ─

test.describe('2FA Email Challenge — anti-swallow', () => {
  test('when the email provider adapter throws, the API must NOT return succeeded:true', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'disp_fail');
    const challengeToken = await loginAndGetChallenge(request, email);

    // Toggle the dev-only "next email send will throw" switch.
    const toggle = await request.post(
      `${API_URL}/dev/2fa-email-events/force-fail`,
      { data: { enabled: true } },
    );
    expect(toggle.ok()).toBeTruthy();

    try {
      const res = await request.post(
        `${API_URL}/auth/2fa/email-otp/request`,
        { data: { challengeToken } },
      );
      expect(
        res.ok(),
        'request endpoint must surface failure as non-2xx',
      ).toBe(false);
      const body = await res.json();
      expect(
        body.succeeded,
        'API must never return succeeded:true when the provider threw',
      ).not.toBe(true);

      // Safe UX message only.
      const msg: string =
        body.message ?? body.Message ?? (body.error?.message ?? '');
      expect(msg.length).toBeGreaterThan(0);
      expect(
        msg,
        `failure message leaked internal detail: '${msg}'`,
      ).not.toMatch(INTERNAL_DETAIL_REGEX);

      const events = await fetchLifecycleEvents(request, challengeToken);
      const names = events.map((e) => e.event);
      expect(names).toContain('2fa_email_provider_dispatch_started');
      expect(names).toContain('2fa_email_provider_dispatch_failed');
      expect(
        names,
        'no succeeded event must be emitted when the provider failed',
      ).not.toContain('2fa_email_provider_dispatch_succeeded');
    } finally {
      await request.post(`${API_URL}/dev/2fa-email-events/force-fail`, {
        data: { enabled: false },
      });
    }
  });
});

// ── 5. Template path is used ──────────────────────────────────────────────

test.describe('2FA Email Challenge — template system', () => {
  test('request emits the 2fa_email_template_rendered lifecycle event', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'disp_tmpl');
    const challengeToken = await loginAndGetChallenge(request, email);

    await request.post(`${API_URL}/auth/2fa/email-otp/request`, {
      data: { challengeToken },
    });

    const events = await fetchLifecycleEvents(request, challengeToken);
    const names = events.map((e) => e.event);
    expect(
      names,
      'template rendering must be observable via the 2fa_email_template_rendered event',
    ).toContain('2fa_email_template_rendered');
  });
});

// ── 6. Full 2FA email code user flow end-to-end ────────────────────────────

test.describe('2FA Email Challenge — end-to-end flow', () => {
  test('request → read code → verify → session cookie', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'disp_e2e');
    const challengeToken = await loginAndGetChallenge(request, email);

    const req = await request.post(`${API_URL}/auth/2fa/email-otp/request`, {
      data: { challengeToken },
    });
    expect(req.status()).toBe(200);

    const dev = await request.get(
      `${API_URL}/dev/last-email-otp?challengeToken=${challengeToken}`,
    );
    expect(dev.ok()).toBeTruthy();
    const { code: otpCode } = await dev.json();
    expect(otpCode).toMatch(/^\d{6}$/);

    const verify = await request.post(
      `${API_URL}/auth/2fa/email-otp/verify`,
      { data: { challengeToken, otp: otpCode } },
    );
    expect(verify.ok(), 'verify must succeed with the issued OTP').toBeTruthy();
    const body = await verify.json();
    expect(body.succeeded, 'verify response must report succeeded:true').toBe(
      true,
    );
    expect(
      body.accessToken,
      'verify must return an access token (session established)',
    ).toBeTruthy();
  });
});

// ── Frontend integration (Vitest, not Playwright) ──────────────────────────
//
// The UI assertions for "Usar código por correo" (safe error formatting, no
// provider-internals leak, the {"error"} literal-string bug never regresses)
// are covered by a Vitest unit test on the ChallengeScreen component:
//   src/frontend/web/src/features/auth/components/__tests__/ChallengeScreen.test.tsx
//
// Those tests assert that:
//   - clicking the button fires TwoFactorService.requestEmailOtp
//   - on success the safe "Código enviado a …" banner shows (no internal text)
//   - on failure the alert shows the catalogued safe message and never
//     renders the raw axios message nor the backend ErrorCode string
//   - the literal-string bug (`{"error"}`) does not regress.
//
// Keeping UI-render coverage in Vitest follows Playwright best-practice
// guidance: don't assert text-rendering styling/text in browser e2e when a
// unit-level test of the same component gives a faster, more deterministic
// gate.
