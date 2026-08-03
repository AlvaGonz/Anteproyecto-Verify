import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

async function currentTotpForUser(request: any, email: string): Promise<string> {
  const r = await request.get(`${API_URL}/dev/current-totp-by-email?email=${encodeURIComponent(email)}`);
  const body = await r.json();
  return body.code;
}

async function registerAndVerify(request: any, prefix: string) {
  const email = `2fa_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
  const reg = await request.post(`${API_URL}/auth/register`, {
    data: { nombre: 'Audit', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
  });
  expect(reg.ok()).toBeTruthy();
  const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
  const token = (await dev.json()).token;
  await request.get(`${API_URL}/auth/verify?token=${token}`);
  return email;
}

async function enable2faWithRealCode(request: any, email: string) {
  await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
  const begin = await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
  const { secret } = await begin.json();
  const totp = await request.get(`${API_URL}/dev/current-totp?secret=${encodeURIComponent(secret)}`);
  const { code } = await totp.json();
  await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code } });
}

test.describe('2FA - Audit Events', () => {
  test('Enabling 2FA records a TwoFactorActivado audit event', async ({ request }) => {
    const email = await registerAndVerify(request, 'auditA');
    await enable2faWithRealCode(request, email);

    const audit = await request.get(`${API_URL}/admin/audit?tipoEvento=TwoFactorActivado`);
    expect(audit.ok()).toBeTruthy();

    const records: any[] = await audit.json();
    expect(Array.isArray(records)).toBeTruthy();
    expect(records.some((r: any) => r.tipoEvento === 'TwoFactorActivado')).toBeTruthy();
  });

  test('Disabling 2FA records a TwoFactorDesactivado audit event', async ({ request }) => {
    const email = await registerAndVerify(request, 'auditB');
    await enable2faWithRealCode(request, email);

    await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const code = await currentTotpForUser(request, email);
    await request.post(`${API_URL}/auth/2fa/disable`, {
      data: { password: validPassword, code },
    });

    const audit = await request.get(`${API_URL}/admin/audit?tipoEvento=TwoFactorDesactivado`);
    const records: any[] = await audit.json();
    expect(records.some((r: any) => r.tipoEvento === 'TwoFactorDesactivado')).toBeTruthy();
  });

  test('Successful TOTP verify records TwoFactorVerificado; bad code records TwoFactorFallido', async ({ request }) => {
    const email = await registerAndVerify(request, 'auditC');
    await enable2faWithRealCode(request, email);

    const login = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken } = await login.json();

    await request.post(`${API_URL}/auth/2fa/verify`, {
      data: { challengeToken, code: '111111' },
    });

    const failed = await request.get(`${API_URL}/admin/audit?tipoEvento=TwoFactorFallido`);
    const failedRecords: any[] = await failed.json();
    expect(failedRecords.some((r: any) => r.tipoEvento === 'TwoFactorFallido')).toBeTruthy();

    // Need a fresh challenge for the successful attempt
    const login2 = await request.post(`${API_URL}/auth/login`, { data: { email, password: validPassword } });
    const { challengeToken: challenge2 } = await login2.json();
    const goodCode = await currentTotpForUser(request, email);
    await request.post(`${API_URL}/auth/2fa/verify`, {
      data: { challengeToken: challenge2, code: goodCode },
    });

    const verified = await request.get(`${API_URL}/admin/audit?tipoEvento=TwoFactorVerificado`);
    const verifiedRecords: any[] = await verified.json();
    expect(verifiedRecords.some((r: any) => r.tipoEvento === 'TwoFactorVerificado')).toBeTruthy();
  });
});
