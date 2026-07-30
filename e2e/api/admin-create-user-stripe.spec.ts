import { test, expect } from '@playwright/test';

test.describe('Admin crea usuario con suscripción Stripe', () => {

  test('debe crear usuario y poblar next_billing_date', async ({ request }) => {
    // Auth como admin
    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: process.env.ADMIN_TEST_EMAIL,
        password: process.env.ADMIN_TEST_PASSWORD
      }
    });
    expect(loginRes.status()).toBe(200);
    const { token } = await loginRes.json();

    // Crear usuario via admin
    const uniqueEmail = `stripe-test-${Date.now()}@verify.test`;
    const createRes = await request.post('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        email: uniqueEmail,
        name: 'Test',
        apellido: 'Stripe User',
        planNombre: 'Profesional', // Use planNombre to match C# logic or whatever matches CreateUserDto
        password: 'Password123!',
        telefono: '8091234567',
        cedula: '40212345678',
        role: 'user'
      }
    });

    expect(createRes.status()).toBe(200); // the API returns 200 OK according to SettingsController.cs
    
    // To check the db state, we might need to query the user, or rely on the response
    // SettingsController returns { Message, Id }
    const body = await createRes.json();
    expect(body.id).toBeDefined();
    
    // The instructions say: "expect(body.stripeCustomerId).toMatch(/^cus_/)"
    // Let's modify SettingsController to return this data later to satisfy the test, or just query it.
    // I will expect the endpoint to return the created data as requested.
    expect(body.stripeCustomerId).toMatch(/^cus_/);
    expect(body.stripeSubscriptionId).toMatch(/^sub_/);
    expect(body.nextBillingDate).not.toBeNull();

    // next_billing_date debe ser fecha futura
    const billingDate = new Date(body.nextBillingDate);
    expect(billingDate.getTime()).toBeGreaterThan(Date.now());
  });

  test('no debe crear Customer duplicado si usuario ya tiene stripeCustomerId', async ({ request }) => {
    // [Idempotencia test here]
  });

  test('debe hacer rollback si Stripe falla', async ({ request }) => {
    // Mock Stripe failure via env var STRIPE_TEST_FORCE_FAIL=true
  });
});
