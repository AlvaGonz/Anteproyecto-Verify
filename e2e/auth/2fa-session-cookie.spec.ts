import { test, expect, request } from "@playwright/test";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

async function getTotpFor(request: any, email: string): Promise<string> {
  const r = await request.get(`${API_URL}/dev/current-totp-by-email?email=${encodeURIComponent(email)}`);
  const body = await r.json();
  return String(body.code);
}

test.describe("2FA - Verify session cookies (refresh contract)", () => {
  test("After successful 2FA verify, /auth/refresh succeeds with the verify response cookies", async ({ playwright }) => {
    const email = `2fa_session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

    // Bootstrap: register + verify-email + login + enable 2FA.
    const ctx = await playwright.request.newContext();
    await ctx.post(`${API_URL}/auth/register`, {
      data: { nombre: "Session", apellido: "Test", email, password: "Pass1234!", confirmPassword: "Pass1234!" },
    });
    const devToken = await ctx.get(`${API_URL}/dev/last-verification-token?email=${encodeURIComponent(email)}`);
    const token = (await devToken.json()).token as string;
    await ctx.get(`${API_URL}/auth/verify?token=${token}`);
    await ctx.post(`${API_URL}/auth/login`, { data: { email, password: "Pass1234!" } });
    await ctx.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const totp = await getTotpFor(ctx, email);
    await ctx.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: Number(totp) } });

    // Fresh context (clean cookies) → exercise the challenge flow.
    const ctx2 = await playwright.request.newContext();
    const login = await ctx2.post(`${API_URL}/auth/login`, { data: { email, password: "Pass1234!" } });
    const body = await login.json();
    expect(body.requires2fa, `login must issue a 2FA challenge. Status=${login.status()}; body=${JSON.stringify(body)}`).toBe(true);

    const totp2 = await getTotpFor(ctx2, email);
    const verify = await ctx2.post(`${API_URL}/auth/2fa/verify`, { data: { challengeToken: body.challengeToken, code: Number(totp2) } });
    expect(verify.ok(), `2FA verify must succeed: ${await verify.text()}`).toBeTruthy();

    // THE BUG: after 2FA verify, /auth/refresh must work because the verify
    // endpoint should have issued BOTH a jwt cookie AND a refreshToken cookie.
    const refresh = await ctx2.post(`${API_URL}/auth/refresh`);
    expect(refresh.status(), `POST /auth/refresh must succeed after 2FA verify (got ${refresh.status()}; body=${await refresh.text()})`).toBe(200);

    await ctx.dispose();
    await ctx2.dispose();
  });
});
