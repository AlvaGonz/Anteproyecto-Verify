import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

async function currentTotpForSecret(request: any, secret: string): Promise<string> {
  const r = await request.get(`${API_URL}/dev/current-totp?secret=${encodeURIComponent(secret)}`);
  const body = await r.json();
  return body.code;
}

async function registerVerifyEnable(request: any, prefix: string): Promise<{ email: string; recoveryCodes: string[] }> {
  const email = `2fa_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
  await request.post(`${API_URL}/auth/register`, {
    data: { nombre: 'Recovery', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
  });
  const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
  const token = (await dev.json()).token;
  await request.get(`${API_URL}/auth/verify?token=${token}`);
  await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
  const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
  const { secret } = await begin.json();
  const code = await currentTotpForSecret(request, secret);
  const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code } });
  if (!confirm.ok()) {
    const body = await confirm.text();
    throw new Error(`confirm failed: ${confirm.status()} ${body}`);
  }
  return { email, recoveryCodes: (await confirm.json()).recoveryCodes as string[] };
}

test.describe('2FA - Recovery Code', () => {
  test('Recovery code consumed once, second use rejected', async ({ request }) => {
    const { email, recoveryCodes } = await registerVerifyEnable(request, 'recovery_once');

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken } = await login.json();

    const usedCode = recoveryCodes[0];

    const first = await request.post(`${API_URL}/auth/2fa/recovery-code`, {
      data: { challengeToken, code: usedCode },
    });
    if (first.status() !== 200) {
      const body = await first.text();
      throw new Error(`recovery-code returned ${first.status()}: ${body}`);
    }
    expect(first.status()).toBe(200);

    const login2 = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken: challenge2 } = await login2.json();

    const second = await request.post(`${API_URL}/auth/2fa/recovery-code`, {
      data: { challengeToken: challenge2, code: usedCode },
    });
    expect([400, 401].includes(second.status())).toBeTruthy();
  });

  test('Different recovery code from same set succeeds', async ({ request }) => {
    const { email, recoveryCodes } = await registerVerifyEnable(request, 'recovery_diff');

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken } = await login.json();

    const secondCode = recoveryCodes[1];
    const ok = await request.post(`${API_URL}/auth/2fa/recovery-code`, {
      data: { challengeToken, code: secondCode },
    });
    expect(ok.status()).toBe(200);
  });
});
