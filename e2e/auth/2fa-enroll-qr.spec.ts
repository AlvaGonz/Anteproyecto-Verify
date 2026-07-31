import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

async function registerAndLogin(request: any, prefix: string): Promise<string> {
  const email = `2fa_qr_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
  await request.post(`${API_URL}/auth/register`, {
    data: { nombre: 'QR', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
  });
  const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
  const token = (await dev.json()).token;
  await request.get(`${API_URL}/auth/verify?token=${token}`);
  await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
  return email;
}

test.describe('2FA — Enrollment by QR (API contract)', () => {
  test('begin returns otpauthUri with secret that is a valid base32 string', async ({ request }) => {
    const email = await registerAndLogin(request, 'uri');

    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    expect(begin.status()).toBe(200);

    const body = await begin.json();
    expect(body.succeeded).toBe(true);

    expect(typeof body.secret).toBe('string');
    expect(body.secret).toMatch(/^[A-Z2-7]+$/);

    expect(body.otpAuthUri).toMatch(/^otpauth:\/\/totp\//);
    expect(body.otpAuthUri).toContain(`secret=${body.secret}`);
    expect(body.otpAuthUri).toMatch(/issuer=VeriFinca/);
  });

  test('begin → confirm → status: no secret or recoveryCodes leak in status', async ({ request }) => {
    const email = await registerAndLogin(request, 'noleak');

    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    const { secret } = await begin.json();

    const totpRes = await request.get(`${API_URL}/dev/current-totp?secret=${encodeURIComponent(secret)}`);
    const { code } = await totpRes.json();

    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code } });
    const confirmBody = await confirm.json();
    expect(confirmBody.succeeded).toBe(true);
    expect(confirmBody.recoveryCodes).toHaveLength(10);
    expect(confirmBody.secret).toBeUndefined();

    const status = await request.get(`${API_URL}/auth/2fa/status`);
    const statusBody = await status.json();
    expect(statusBody.enabled).toBe(true);
    expect(statusBody.hasRecoveryCodes).toBe(true);
    expect(statusBody.secret).toBeUndefined();
    expect(statusBody.recoveryCodes).toBeUndefined();
    expect(statusBody.otpAuthUri).toBeUndefined();
  });

  test('invalid confirm code → safe error envelope (no exception leaks)', async ({ request }) => {
    const email = await registerAndLogin(request, 'invalid');

    const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    expect(begin.status()).toBe(200);

    const confirm = await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, {
      data: { code: 111111 },
    });
    expect(confirm.status()).toBe(400);

    const body = await confirm.json();
    expect(body.code).toBeTruthy();
    expect(typeof body.code).toBe('string');
    expect(body.message).toBeTruthy();
    expect(typeof body.message).toBe('string');
    expect(body.correlationId).toBeTruthy();

    const json = JSON.stringify(body);
    expect(json).not.toMatch(/SqlException|FOREIGN KEY|column|stack|exception|null/i);
  });
});
