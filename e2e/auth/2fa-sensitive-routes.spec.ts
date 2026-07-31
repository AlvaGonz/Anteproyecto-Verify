import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

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

test.describe('2FA - Sensitive Routes Step-up', () => {
  test('Non-2FA user accessing sensitive route succeeds (regression)', async ({ request }) => {
    const email = await registerVerifiedUser(request);
    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });

    // /api/account/delete is irreversible → only "regression" non-2FA users bypass [RequireTwoFactor]
    const del = await request.post(`${API_URL}/account/delete`, {
      data: { Password: validPassword, Confirmation: 'ELIMINAR' },
    });
    expect([200, 204].includes(del.status())).toBeTruthy();
  });

  test('2FA-enabled user without amr=2fa claim is blocked from sensitive route', async ({ request }) => {
    const email = await registerVerifiedUser(request);
    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });

    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });

    // Login AGAIN — challenge issued (no JWT cookie)
    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });

    const del = await request.post(`${API_URL}/account/delete`, {
      data: { Password: validPassword, Confirmation: 'ELIMINAR' },
    });
    expect(del.status()).toBe(401);
    const body = await del.json();
    expect(body.code).toBe('mfa_required');
  });

  test('2FA-enabled user with amr=2fa claim can hit sensitive route', async ({ request }) => {
    const email = await registerVerifiedUser(request);
    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });

    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });
    const { challengeToken } = await login.json();

    const verify = await request.post(`${API_URL}/auth/2fa/verify`, {
      data: { challengeToken, code: '000000' },
    });
    expect(verify.status()).toBe(200);

    const del = await request.post(`${API_URL}/account/delete`, {
      data: { Password: validPassword, Confirmation: 'ELIMINAR' },
    });
    expect([200, 204].includes(del.status())).toBeTruthy();
  });
});
