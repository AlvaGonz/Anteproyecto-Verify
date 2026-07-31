import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';
const validPassword = 'Password123!';

test.describe('2FA - Audit Events', () => {
  test('Enabling 2FA records a TwoFactorActivado audit event', async ({ request }) => {
    const email = `2fa_auditA_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { nombre: 'Audit', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
    });
    const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
    const token = (await dev.json()).token;
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });
    await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });

    const audit = await request.get(`${API_URL}/admin/audit?tipoEvento=TwoFactorActivado`);
    expect(audit.ok()).toBeTruthy();

    const records: any[] = await audit.json();
    expect(Array.isArray(records)).toBeTruthy();
    const found = records.some(r => r.tipoEvento === 'TwoFactorActivado');
    expect(found).toBeTruthy();
  });

  test('Disabling 2FA records a TwoFactorDesactivado audit event', async ({ request }) => {
    const email = `2fa_auditB_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { nombre: 'Audit', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
    });
    const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
    const token = (await dev.json()).token;
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });
    await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });

    // Re-login to get a session (challenge would block otherwise)
    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });
    await request.post(`${API_URL}/auth/2fa/disable`, {
      data: { password: validPassword, code: '000000' },
    });

    const audit = await request.get(`${API_URL}/admin/audit?tipoEvento=TwoFactorDesactivado`);
    const records: any[] = await audit.json();
    expect(records.some(r => r.tipoEvento === 'TwoFactorDesactivado')).toBeTruthy();
  });

  test('Successful TOTP verify records TwoFactorVerificado; bad code records TwoFactorFallido', async ({ request }) => {
    const email = `2fa_auditC_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
    await request.post(`${API_URL}/auth/register`, {
      data: { nombre: 'Audit', apellidos: 'Tester', email, password: validPassword, confirmPassword: validPassword },
    });
    const dev = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
    const token = (await dev.json()).token;
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });
    await request.post(`${API_URL}/auth/2fa/enrollment/begin`);
    await request.post(`${API_URL}/auth/2fa/enrollment/confirm`, { data: { code: '000000' } });

    // Issue a challenge via login
    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email, password: validPassword },
    });
    const { challengeToken } = await login.json();

    // One bad attempt → TwoFactorFallido
    await request.post(`${API_URL}/auth/2fa/verify`, {
      data: { challengeToken, code: '111111' },
    });

    const failed = await request.get(`${API_URL}/admin/audit?tipoEvento=TwoFactorFallido`);
    const failedRecords: any[] = await failed.json();
    expect(failedRecords.some(r => r.tipoEvento === 'TwoFactorFallido')).toBeTruthy();

    // Successful attempt → TwoFactorVerificado
    await request.post(`${API_URL}/auth/2fa/verify`, {
      data: { challengeToken, code: '000000' },
    });

    const verified = await request.get(`${API_URL}/admin/audit?tipoEvento=TwoFactorVerificado`);
    const verifiedRecords: any[] = await verified.json();
    expect(verifiedRecords.some(r => r.tipoEvento === 'TwoFactorVerificado')).toBeTruthy();
  });
});
