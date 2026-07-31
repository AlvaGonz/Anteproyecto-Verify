import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

test.describe('2FA - Disable (step-up required)', () => {
  let uniqueEmail: string;

  test.beforeAll(async ({ request }) => {
    uniqueEmail = `2fa_disable_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

    const reg = await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Disable',
        apellidos: 'Tester',
        email: uniqueEmail,
        password: validPassword,
        confirmPassword: validPassword,
      },
    });
    expect(reg.ok()).toBeTruthy();

    const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${uniqueEmail}`);
    const token = (await dev.json()).token;
    await request.get(`${API_URL}/auth/verify?token=${token}`);
  });

  async function enableTwoFactor(request: any) {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });
  }

  test('Disable requires valid password', async ({ request }) => {
    await enableTwoFactor(request);

    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });

    const disable = await request.post(`${API_URL}/auth/2fa/disable`, {
      data: { password: 'WrongPassword!', code: '000000' },
    });
    expect([400, 401].includes(disable.status())).toBeTruthy();

    // Status should still be enabled
    const status = await request.get(`${API_URL}/auth/2fa/status`);
    const body = await status.json();
    expect(body.enabled).toBe(true);
  });

  test('Disable requires valid current TOTP', async ({ request }) => {
    await enableTwoFactor(request);

    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });

    const disable = await request.post(`${API_URL}/auth/2fa/disable`, {
      data: { password: validPassword, code: '111111' },
    });
    expect([400, 401].includes(disable.status())).toBeTruthy();

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    const body = await status.json();
    expect(body.enabled).toBe(true);
  });

  test('Disable with valid password + valid TOTP succeeds', async ({ request }) => {
    await enableTwoFactor(request);

    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });

    const disable = await request.post(`${API_URL}/auth/2fa/disable`, {
      data: { password: validPassword, code: '000000' },
    });
    expect(disable.status()).toBe(200);

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    const body = await status.json();
    expect(body.enabled).toBe(false);
  });
});
