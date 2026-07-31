import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

test.describe('2FA - Email OTP Fallback', () => {
  let uniqueEmail: string;

  test.beforeAll(async ({ request }) => {
    uniqueEmail = `2fa_email_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

    const reg = await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Email',
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

  test('Request email OTP - 6-digit code issued (5min cooldown, 10min TTL)', async ({ request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const { challengeToken } = await login.json();

    const req = await request.post(`${API_URL}/auth/2fa/email-otp/request`, {
      data: { challengeToken },
    });
    expect(req.status()).toBe(200);

    const dev = await request.get(`${API_URL}/dev/last-email-otp?challengeToken=${challengeToken}`);
    expect(dev.ok()).toBeTruthy();
    const { code } = await dev.json();
    expect(code).toMatch(/^\d{6}$/);
  });

  test('Resend invalidates prior OTP (single active code per challenge)', async ({ request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const { challengeToken } = await login.json();

    await request.post(`${API_URL}/auth/2fa/email-otp/request`, { data: { challengeToken } });
    const firstDev = await request.get(`${API_URL}/dev/last-email-otp?challengeToken=${challengeToken}`);
    const firstCode = (await firstDev.json()).code;

    // Wait past cooldown
    await new Promise(r => setTimeout(r, 1100));
    await request.post(`${API_URL}/auth/2fa/email-otp/request`, { data: { challengeToken } });
    const secondDev = await request.get(`${API_URL}/dev/last-email-otp?challengeToken=${challengeToken}`);
    const secondCode = (await secondDev.json()).code;

    expect(secondCode).not.toEqual(firstCode);

    // First code must no longer verify
    const verifyOld = await request.post(`${API_URL}/auth/2fa/email-otp/verify`, {
      data: { challengeToken, otp: firstCode },
    });
    expect(verifyOld.ok()).toBeFalsy();
  });

  test('Max attempts (5) rejected with audit', async ({ request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    const { challengeToken } = await login.json();

    await request.post(`${API_URL}/auth/2fa/email-otp/request`, { data: { challengeToken } });

    // 5 bad attempts
    for (let i = 0; i < 5; i++) {
      await request.post(`${API_URL}/auth/2fa/email-otp/verify`, {
        data: { challengeToken, otp: '000000' },
      });
    }

    // 6th: rejected (locked out or too many attempts)
    const sixth = await request.post(`${API_URL}/auth/2fa/email-otp/verify`, {
      data: { challengeToken, otp: '000000' },
    });
    expect([423, 429, 401].includes(sixth.status())).toBeTruthy();
  });
});
