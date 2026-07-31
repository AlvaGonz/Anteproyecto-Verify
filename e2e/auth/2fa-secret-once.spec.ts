import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

test.describe('2FA - Secret returned exactly once', () => {
  test('TOTP secret is returned by begin only, never by status or confirm', async ({ request }) => {
    const email = `2fa_secret_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { nombre: 'Secret', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
    });
    const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
    const token = (await dev.json()).token;
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });

    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    expect(begin.status()).toBe(200);
    const beginBody = await begin.json();
    const secret = beginBody.secret;

    expect(typeof secret).toBe('string');
    expect(secret.length).toBeGreaterThan(10);

    // Confirm enrollment
    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, {
      data: { code: '000000' },
    });
    const confirmBody = await confirm.json();
    expect(confirmBody.secret).toBeUndefined();

    // GET /2fa/status must NOT include the secret
    const status1 = await request.get(`${API_URL}/auth/2fa/status`);
    const status1Body = await status1.json();
    expect(status1Body.secret).toBeUndefined();

    // A second status check still must NOT include the secret
    const status2 = await request.get(`${API_URL}/auth/2fa/status`);
    const status2Body = await status2.json();
    expect(status2Body.secret).toBeUndefined();
  });

  test('Recovery codes are returned by confirm only, never by status', async ({ request }) => {
    const email = `2fa_secretB_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { nombre: 'Secret', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
    });
    const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
    const token = (await dev.json()).token;
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });

    await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, {
      data: { code: '000000' },
    });
    const confirmBody = await confirm.json();
    expect(Array.isArray(confirmBody.recoveryCodes)).toBeTruthy();
    expect(confirmBody.recoveryCodes.length).toBe(10);

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    const statusBody = await status.json();
    expect(statusBody.recoveryCodes).toBeUndefined();
    expect(statusBody.hasRecoveryCodes).toBe(true);
  });
});
