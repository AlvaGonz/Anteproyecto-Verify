import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

async function registerAndLogin(request: any, prefix: string): Promise<string> {
  const email = `2fa_safe_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
  await request.post(`${API_URL}/auth/register`, {
    data: { nombre: 'Safe', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
  });
  const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
  const token = (await dev.json()).token;
  await request.get(`${API_URL}/auth/verify?token=${token}`);
  await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
  return email;
}

test.describe('2FA — Safe error contract (no internal leaks)', () => {
  test('enrollment begin + confirm invalid code returns code + message + correlationId, no exception names', async ({ request }) => {
    await registerAndLogin(request, 'safe');

    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    expect(begin.status()).toBe(200);
    const beginBody = await begin.json();
    expect(beginBody).toHaveProperty('secret');
    expect(beginBody).toHaveProperty('otpAuthUri');

    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, {
      data: { code: 111111 },
    });
    expect(confirm.status()).toBe(400);

    const body = await confirm.json();
    expect(body).toHaveProperty('code');
    expect(typeof body.code).toBe('string');
    expect(body.code).toMatch(/^[A-Z0-9_]+$/);

    expect(body).toHaveProperty('message');
    expect(typeof body.message).toBe('string');

    expect(body).toHaveProperty('correlationId');

    const json = JSON.stringify(body);
    expect(json).not.toMatch(/SqlException|FOREIGN KEY|column|NullReferenceException|stack/i);
  });

  test('enrollment confirm after activation returns code=ENROLLMENT_ALREADY_ACTIVE', async ({ request }) => {
    await registerAndLogin(request, 'duplicate');

    const first = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    expect(first.status()).toBe(200);
    const { secret } = await first.json();

    const totpRes = await request.get(`${API_URL}/dev/current-totp?secret=${encodeURIComponent(secret)}`);
    const { code } = await totpRes.json();

    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code } });
    expect(confirm.status()).toBe(200);

    const second = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    expect(second.status()).toBe(400);
    const body = await second.json();
    expect(body.code).toBe("ENROLLMENT_ALREADY_ACTIVE");
    expect(typeof body.message).toBe('string');
    expect(body.correlationId).toBeTruthy();
  });

  test('confirm with no pending enrollment returns code=NO_PENDING_ENROLLMENT', async ({ request }) => {
    await registerAndLogin(request, 'nopen');

    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, {
      data: { code: 123456 },
    });
    expect(confirm.status()).toBe(400);
    const body = await confirm.json();
    expect(body.code).toBeTruthy();
    expect(typeof body.message).toBe('string');
  });

  test('status endpoint never returns secret or recoveryCodes', async ({ request }) => {
    await registerAndLogin(request, 'stat');
    const status = await request.get(`${API_URL}/auth/2fa/status`);
    expect(status.status()).toBe(200);
    const body = await status.json();
    expect(body.secret).toBeUndefined();
    expect(body.recoveryCodes).toBeUndefined();
    expect(body.otpAuthUri).toBeUndefined();
  });
});
