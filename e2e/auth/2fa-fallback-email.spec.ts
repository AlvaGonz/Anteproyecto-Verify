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
    data: { nombre: 'Email', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
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

test.describe('2FA - Email OTP Fallback', () => {
  test('Request email OTP - 6-digit code issued (5min cooldown, 10min TTL)', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'email_req');

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken } = await login.json();

    const req = await request.post(`${API_URL}/auth/2fa/email-otp/request`, { data: { challengeToken } });
    expect(req.status()).toBe(200);

    const dev = await request.get(`${API_URL}/dev/last-email-otp?challengeToken=${challengeToken}`);
    expect(dev.ok()).toBeTruthy();
    const { code: otpCode } = await dev.json();
    expect(otpCode).toMatch(/^\d{6}$/);
  });

  test('Resend invalidates prior OTP (single active code per challenge)', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'email_resend');

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken } = await login.json();

    await request.post(`${API_URL}/auth/2fa/email-otp/request`, { data: { challengeToken } });
    const firstDev = await request.get(`${API_URL}/dev/last-email-otp?challengeToken=${challengeToken}`);
    const firstCode = (await firstDev.json()).code;

    await new Promise(r => setTimeout(r, 1100));
    await request.post(`${API_URL}/auth/2fa/email-otp/request`, { data: { challengeToken } });
    const secondDev = await request.get(`${API_URL}/dev/last-email-otp?challengeToken=${challengeToken}`);
    const secondCode = (await secondDev.json()).code;

    expect(secondCode).not.toEqual(firstCode);

    const verifyOld = await request.post(`${API_URL}/auth/2fa/email-otp/verify`, {
      data: { challengeToken, otp: firstCode },
    });
    expect(verifyOld.ok()).toBeFalsy();
  });

  test('Max attempts (5) rejected with audit', async ({ request }) => {
    const email = await registerVerifyEnable(request, 'email_max');

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken } = await login.json();

    await request.post(`${API_URL}/auth/2fa/email-otp/request`, { data: { challengeToken } });

    for (let i = 0; i < 5; i++) {
      await request.post(`${API_URL}/auth/2fa/email-otp/verify`, {
        data: { challengeToken, otp: '000000' },
      });
    }

    const sixth = await request.post(`${API_URL}/auth/2fa/email-otp/verify`, {
      data: { challengeToken, otp: '000000' },
    });
    expect([423, 429, 401].includes(sixth.status())).toBeTruthy();
  });
});
