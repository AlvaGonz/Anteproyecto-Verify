import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

test.describe('2FA - Recovery Code', () => {
  let uniqueEmail: string;

  test.beforeAll(async ({ request }) => {
    uniqueEmail = `2fa_recovery_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

    const reg = await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Recovery',
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

  test('Recovery code consumed once, second use rejected', async ({ request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();
    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, {
      data: { code: '000000' },
    });
    const { recoveryCodes } = await confirm.json();

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const { challengeToken } = await login.json();

    const usedCode = recoveryCodes[0];

    // First use: succeeds
    const first = await request.post(`${API_URL}/auth/2fa/recovery-code`, {
      data: { challengeToken, code: usedCode },
    });
    expect(first.status()).toBe(200);
    const cookies = first.headers()['set-cookie'];
    expect(cookies).toContain('jwt');

    // Need a fresh login to get a new challenge
    const login2 = await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const { challengeToken: challenge2 } = await login2.json();

    // Second use of same code: rejected
    const second = await request.post(`${API_URL}/auth/2fa/recovery-code`, {
      data: { challengeToken: challenge2, code: usedCode },
    });
    expect([400, 401].includes(second.status())).toBeTruthy();
  });

  test('Different recovery code from same set succeeds', async ({ request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();
    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, {
      data: { code: '000000' },
    });
    const { recoveryCodes } = await confirm.json();

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const { challengeToken } = await login.json();

    const secondCode = recoveryCodes[1];
    const ok = await request.post(`${API_URL}/auth/2fa/recovery-code`, {
      data: { challengeToken, code: secondCode },
    });
    expect(ok.status()).toBe(200);
  });
});
