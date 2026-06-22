import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';

test.describe('05 - Logout Flow', () => {
  let uniqueEmail: string;
  const validPassword = 'Password123!';

  test.beforeAll(async ({ request }) => {
    uniqueEmail = `logout_test_${Date.now()}@example.com`;
    
    await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Logout',
        apellidos: 'Tester',
        email: uniqueEmail,
        password: validPassword,
        confirmPassword: validPassword
      }
    });

    const devResponse = await request.get(`${API_URL}/dev/last-verification-token?email=${uniqueEmail}`);
    const token = (await devResponse.json()).token;

    await request.get(`${API_URL}/auth/verify?token=${token}`);
  });

  test('Edge Case - Should handle logout without session', async ({ request }) => {
    // Calling logout without having logged in
    const response = await request.post(`${API_URL}/auth/logout`);
    // Should typically return 200/204 or just succeed idempotently
    expect(response.ok()).toBeTruthy();
  });

  test('Happy Path - Should delete cookie on logout', async ({ request }) => {
    // 1. Login
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword }
    });

    // 2. Ensure session exists
    let meResponse = await request.get(`${API_URL}/auth/me`);
    expect(meResponse.ok()).toBeTruthy();

    // 3. Logout
    const logoutResponse = await request.post(`${API_URL}/auth/logout`);
    expect(logoutResponse.ok()).toBeTruthy();
    
    // Cookie should be cleared by the response header
    const cookies = logoutResponse.headers()['set-cookie'];
    // In .NET, usually deleting a cookie sets it to empty and sets an expiration in the past
    expect(cookies).toMatch(/jwt=;/i); // checking if it's cleared or expired

    // 4. Ensure session is gone
    meResponse = await request.get(`${API_URL}/auth/me`);
    expect(meResponse.status()).toBe(401);
  });

  test('Edge Case - Should handle logout twice idempotently', async ({ request }) => {
    // 1. Login
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword }
    });

    // 2. First Logout
    await request.post(`${API_URL}/auth/logout`);

    // 3. Second Logout
    const response = await request.post(`${API_URL}/auth/logout`);
    expect(response.ok()).toBeTruthy();
  });
});
