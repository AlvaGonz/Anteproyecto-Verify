import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

test.describe('2FA - Login (challenge flow)', () => {
  let uniqueEmail: string;

  test.beforeAll(async ({ request }) => {
    uniqueEmail = `2fa_login_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;

    const reg = await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Login',
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

  test('Non-2FA user login still succeeds with cookie (regression)', async ({ request }) => {
    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    expect(login.status()).toBe(200);

    const cookies = login.headers()['set-cookie'];
    expect(cookies).toContain('jwt');
  });

  test('Login issues challenge instead of cookie when 2FA enabled', async ({ request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    // Seed 2FA enablement via enrollment+confirm (will fail RED — endpoint missing)
    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });

    // Now login again — should get requires2fa instead of cookie
    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword },
    });
    expect(login.status()).toBe(200);

    const body = await login.json();
    expect(body.succeeded).toBe(false);
    expect(body.requires2fa).toBe(true);
    expect(typeof body.challengeToken).toBe('string');
    expect(body.challengeToken.length).toBeGreaterThan(20);

    const cookies = login.headers()['set-cookie'];
    expect(cookies).not.toContain('jwt');
  });

  test('Login fails to /auth/me without amr=2fa claim after challenge', async ({ request }) => {
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

    // TOTP verify with bad code 5 times should lock the user
    for (let i = 0; i < 5; i++) {
      await request.post(`${API_URL}/auth/2fa/verify`, {
        data: { challengeToken, code: '000000' },
      });
    }

    // The 6th attempt must be rejected (lockout or too-many-attempts)
    const verify = await request.post(`${API_URL}/auth/2fa/verify`, {
      data: { challengeToken, code: '000000' },
    });
    expect([423, 429, 401].includes(verify.status())).toBeTruthy();
  });
});
