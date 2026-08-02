import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

async function currentTotpForSecret(request: any, secret: string): Promise<string> {
  const r = await request.get(`${API_URL}/dev/current-totp?secret=${encodeURIComponent(secret)}`);
  const body = await r.json();
  return body.code;
}

async function currentTotpForUser(request: any, email: string): Promise<string> {
  const r = await request.get(`${API_URL}/dev/current-totp-by-email?email=${encodeURIComponent(email)}`);
  const body = await r.json();
  return body.code;
}

async function registerVerifiedUser(request: any): Promise<string> {
  const email = `2fa_sens_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
  await request.post(`${API_URL}/auth/register`, {
    data: { nombre: 'Sens', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
  });
  const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
  const token = (await dev.json()).token;
  await request.get(`${API_URL}/auth/verify?token=${token}`);
  return email;
}

async function enableTwoFactor(request: any, email: string): Promise<void> {
  await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
  const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
  const { secret } = await begin.json();
  const code = await currentTotpForSecret(request, secret);
  await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code } });
  // Clear the cookie so the test starts with a clean slate; otherwise both cookies
  // (the old amr=pwd and the upcoming amr=2fa) are sent and ASP.NET picks the first.
  await request.post(`${API_URL}/auth/logout`);
}

test.describe('2FA - Sensitive Routes Step-up', () => {
  test('Non-2FA user accessing sensitive route succeeds (regression)', async ({ request }) => {
    const email = await registerVerifiedUser(request);
    await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });

    const del = await request.post(`${API_URL}/account/delete`, {
      data: { Password: validPassword, Confirmation: 'ELIMINAR' },
    });
    expect([200, 204].includes(del.status())).toBeTruthy();
  });

  test('2FA-enabled user without amr=2fa claim is blocked from sensitive route', async ({ request }) => {
    const email = await registerVerifiedUser(request);
    await enableTwoFactor(request, email);

    // Attempt login — this should issue a challenge, not a JWT cookie
    await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });

    // Without completing 2FA, the JWT cookie is absent. The /account/delete call must fail.
    const del = await request.post(`${API_URL}/account/delete`, {
      data: { Password: validPassword, Confirmation: 'ELIMINAR' },
    });
    // Either no auth → 401, or [RequireTwoFactor] step-up → 403. Both are valid.
    expect([401, 403].includes(del.status())).toBeTruthy();
  });

  test('2FA-enabled user with amr=2fa claim can hit sensitive route', async ({ request }) => {
    const email = await registerVerifiedUser(request);
    await enableTwoFactor(request, email);

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken } = await login.json();

    const goodCode = await currentTotpForUser(request, email);
    const verify = await request.post(`${API_URL}/auth/2fa/verify`, {
      data: { challengeToken, code: goodCode },
    });
    expect(verify.status()).toBe(200);

    const del = await request.post(`${API_URL}/account/delete`, {
      data: { Password: validPassword, Confirmation: 'ELIMINAR' },
    });
    if (![200, 204].includes(del.status())) {
      const body = await del.text();
      throw new Error(`delete returned ${del.status()}: ${body}`);
    }
    expect([200, 204].includes(del.status())).toBeTruthy();
  });
});
