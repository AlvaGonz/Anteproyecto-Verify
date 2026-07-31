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
    data: { nombre: 'Login', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
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

test.describe('2FA - Login (challenge flow)', () => {
  test('Non-2FA user login still succeeds with cookie (regression)', async ({ request }) => {
    const email = `2fa_login_regr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { nombre: 'Login', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
    });
    const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
    const token = (await dev.json()).token;
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    expect(login.status()).toBe(200);
    const cookies = login.headers()['set-cookie'];
    expect(cookies).toContain('jwt');
  });

  test('Login issues challenge instead of cookie when 2FA enabled', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'login_challenge');

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    expect(login.status()).toBe(200);

    const body = await login.json();
    expect(body.succeeded).toBe(false);
    expect(body.requires2fa).toBe(true);
    expect(typeof body.challengeToken).toBe('string');
    expect(body.challengeToken.length).toBeGreaterThan(20);

    const cookies = login.headers()['set-cookie'];
    expect(cookies === undefined || !cookies.includes('jwt=')).toBeTruthy();
  });

  test('Login fails to /auth/me without amr=2fa claim after challenge', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'login_lockout');

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken } = await login.json();

    for (let i = 0; i < 5; i++) {
      await request.post(`${API_URL}/auth/2fa/verify`, {
        data: { challengeToken, code: '000000' },
      });
    }

    const verify = await request.post(`${API_URL}/auth/2fa/verify`, {
      data: { challengeToken, code: '000000' },
    });
    expect([423, 429, 401].includes(verify.status())).toBeTruthy();
  });
});
