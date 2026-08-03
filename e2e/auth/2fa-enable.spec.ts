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

async function registerVerifyEnable(request: any, prefix: string): Promise<string> {
  const email = `2fa_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
  await request.post(`${API_URL}/auth/register`, {
    data: { nombre: 'Enable', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
  });
  const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
  const token = (await dev.json()).token;
  await request.get(`${API_URL}/auth/verify?token=${token}`);
  await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
  const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
  const { secret } = await begin.json();
  const code = await currentTotpForSecret(request, secret);
  await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code } });
  return email;
}

test.describe('2FA - Enable', () => {
  test('Happy Path - Login → begin enrollment returns secret + otpAuthUri', async ({ request }) => {
    const email = `2fa_enable_a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { nombre: 'Enable', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
    });
    const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
    const token = (await dev.json()).token;
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    expect(login.ok()).toBeTruthy();

    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    expect(begin.status()).toBe(200);

    const body = await begin.json();
    expect(typeof body.secret).toBe('string');
    expect(body.secret.length).toBeGreaterThan(10);
    expect(typeof body.otpAuthUri).toBe('string');
    expect(body.otpAuthUri).toContain('otpauth://totp/');
  });

  test('Happy Path - confirm enrollment with valid TOTP returns recoveryCodes once', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'enable_confirm');
    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    // Since 2FA is now enabled, login will issue a challenge — proceed to verify so we have a cookie
    const { challengeToken, requires2fa } = await login.json();
    if (requires2fa) {
      const code = await currentTotpForUser(request, email);
      await request.post(`${API_URL}/auth/2fa/verify`, { data: { challengeToken, code } });
    }

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    expect(status.status()).toBe(200);

    const body = await status.json();
    expect(body.enabled).toBe(true);
    expect(body.hasRecoveryCodes).toBe(true);
  });

  test('Status - GET /auth/2fa/status returns enabled=true after confirmation', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'enable_status');
    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken, requires2fa } = await login.json();
    if (requires2fa) {
      const code = await currentTotpForUser(request, email);
      await request.post(`${API_URL}/auth/2fa/verify`, { data: { challengeToken, code } });
    }

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    expect(status.status()).toBe(200);

    const body = await status.json();
    expect(body.enabled).toBe(true);
    expect(body.hasRecoveryCodes).toBe(true);
  });
});
