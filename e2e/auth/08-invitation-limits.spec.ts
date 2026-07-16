import { test, expect, APIRequestContext } from '@playwright/test';

const API_URL = process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api` : 'http://localhost:5000/api';

test.describe('08 - Invitation Limits', () => {
  const adminEmail = 'admin@verifinca.do';
  const adminPassword = 'AdminVerifinca2026!';
  
  const PLAN_EMPRESA_ID = '41037268-58B6-40A3-A8AE-C18EFE00C7D3';
  const PLAN_CORPORATIVO_ID = 'F8B2465E-19D3-4FA0-90BB-65AEF8BAF6D4';

  let adminContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    // Setup admin context to patch plans
    adminContext = await playwright.request.newContext();
    const loginRes = await adminContext.post(`${API_URL}/auth/login`, {
      data: { email: adminEmail, password: adminPassword }
    });
    expect(loginRes.ok(), 'Admin login failed').toBeTruthy();
  });

  async function registerAndVerifyUser(request: APIRequestContext, email: string) {
    const pass = 'TestPassword123!';
    
    // 1. Register
    const regRes = await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Limit',
        apellidos: 'Tester',
        email,
        password: pass,
        confirmPassword: pass
      }
    });
    expect(regRes.ok(), 'User registration failed').toBeTruthy();

    // 2. Get verification token
    const devRes = await request.get(`${API_URL}/dev/last-verification-token?email=${email}`);
    const devData = await devRes.json();
    const token = devData.token;

    // 3. Verify
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    // 4. Login
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email, password: pass }
    });
    expect(loginRes.ok(), 'User login failed').toBeTruthy();

    // 5. Get user ID
    const meRes = await request.get(`${API_URL}/auth/me`);
    const meData = await meRes.json();
    return meData.id;
  }

  test('Empresa Plan should allow exactly 5 invitations', async ({ request }) => {
    test.setTimeout(30000); // Allow time for loop
    const email = `empresa_limits_${Date.now()}@example.com`;
    const userId = await registerAndVerifyUser(request, email);

    // Patch to Empresa plan
    const patchRes = await adminContext.patch(`${API_URL}/admin/users/${userId}/plan`, {
      data: { planId: PLAN_EMPRESA_ID }
    });
    expect(patchRes.ok(), 'Failed to assign Empresa plan').toBeTruthy();

    // Send 5 successful invites
    for (let i = 1; i <= 5; i++) {
      const invRes = await request.post(`${API_URL}/admin/users/invite`, {
        data: {
          nombre: `Invitee${i}`,
          apellido: 'Test',
          email: `inv_${Date.now()}_${i}@example.com`,
          telefono: '809-555-0000',
          cedula: '001-0000000-1'
        }
      });
      expect(invRes.ok(), `Invitation ${i} should succeed`).toBeTruthy();
    }

    // 6th invite should fail
    const inv6 = await request.post(`${API_URL}/admin/users/invite`, {
      data: {
        nombre: `Invitee6`,
        apellido: 'Test',
        email: `inv_${Date.now()}_6@example.com`,
        telefono: '809-555-0000',
        cedula: '001-0000000-1'
      }
    });
    
    expect(inv6.status()).toBe(400);
    const errData = await inv6.json();
    expect(errData.message || errData.detail || errData.Message).toMatch(/lA-mite de usuarios invitados|límite de usuarios invitados/i);
  });

  test('Corporativo Plan should allow exactly 30 invitations', async ({ request }) => {
    test.setTimeout(90000); // 30 requests take longer
    const email = `corp_limits_${Date.now()}@example.com`;
    const userId = await registerAndVerifyUser(request, email);

    // Patch to Corporativo plan
    const patchRes = await adminContext.patch(`${API_URL}/admin/users/${userId}/plan`, {
      data: { planId: PLAN_CORPORATIVO_ID }
    });
    expect(patchRes.ok(), 'Failed to assign Corporativo plan').toBeTruthy();

    // Send 30 successful invites
    for (let i = 1; i <= 30; i++) {
      const invRes = await request.post(`${API_URL}/admin/users/invite`, {
        data: {
          nombre: `CorpInvitee${i}`,
          apellido: 'Test',
          email: `corpinv_${Date.now()}_${i}@example.com`,
          telefono: '809-555-0000',
          cedula: '001-0000000-1'
        }
      });
      expect(invRes.ok(), `Invitation ${i} should succeed. Status: ${invRes.status()}`).toBeTruthy();
    }

    // 31st invite should fail
    const inv31 = await request.post(`${API_URL}/admin/users/invite`, {
      data: {
        nombre: `CorpInvitee31`,
        apellido: 'Test',
        email: `corpinv_${Date.now()}_31@example.com`,
        telefono: '809-555-0000',
        cedula: '001-0000000-1'
      }
    });
    
    expect(inv31.status()).toBe(400);
    const errData = await inv31.json();
    expect(errData.message || errData.detail || errData.Message).toMatch(/lA-mite de usuarios invitados|límite de usuarios invitados/i);
  });
});
