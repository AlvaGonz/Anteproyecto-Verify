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
    data: { nombre: 'Disable', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
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

test.describe('2FA - Disable (step-up required)', () => {
  test('Disable requires valid password', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'disable_pw');
    await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });

    const disable = await request.post(`${API_URL}/auth/2fa/disable`, {
      data: { password: 'WrongPassword!', code: '111111' },
    });
    expect([400, 401].includes(disable.status())).toBeTruthy();

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    const body = await status.json();
    expect(body.enabled).toBe(true);
  });

  test('Disable requires valid current TOTP', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'disable_code');
    await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });

    const disable = await request.post(`${API_URL}/auth/2fa/disable`, {
      data: { password: validPassword, code: '111111' },
    });
    expect([400, 401].includes(disable.status())).toBeTruthy();

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    const body = await status.json();
    expect(body.enabled).toBe(true);
  });

  test('Disable with valid password + valid TOTP succeeds', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'disable_ok');
    await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });

    const code = await currentTotpForUser(request, email);
    const disable = await request.post(`${API_URL}/auth/2fa/disable`, {
      data: { password: validPassword, code },
    });
    expect(disable.status()).toBe(200);

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    const body = await status.json();
    expect(body.enabled).toBe(false);
  });
});
