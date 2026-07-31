import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

test.describe('2FA - Enable', () => {
  let uniqueEmail: string;

  test.beforeAll(async ({ request }) => {
    uniqueEmail = `2fa_enable_${Date.now()}@example.com`;

    const reg = await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Enable',
        apellidos: 'Tester',
        email: uniqueEmail,
        password: validPassword,
        confirmPassword: validPassword,
      },
    });
    expect(reg.ok()).toBeTruthy();

    const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${uniqueEmail}`);
    const token = (await dev.json()).token;
    const verify = await request.get(`${API_URL}/auth/verify?token=${token}`);
    expect(verify.ok()).toBeTruthy();
  });

  test('Happy Path - Login → begin enrollment returns secret + otpAuthUri', async ({ request }) => {
    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
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
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });

    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();

    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, {
      data: { code: '000000' },
    });
    expect(confirm.status()).toBe(200);

    const body = await confirm.json();
    expect(Array.isArray(body.recoveryCodes)).toBeTruthy();
    expect(body.recoveryCodes.length).toBe(10);
  });

  test('Status - GET /auth/2fa/status returns enabled=true after confirmation', async ({ request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    expect(status.status()).toBe(200);

    const body = await status.json();
    expect(body.enabled).toBe(true);
    expect(body.hasRecoveryCodes).toBe(true);
  });
});
