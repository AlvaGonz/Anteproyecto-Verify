import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';

test.describe('04 - Session Flow', () => {
  let uniqueEmail: string;
  const validPassword = 'Password123!';

  test.beforeAll(async ({ request }) => {
    uniqueEmail = `session_test_${Date.now()}@example.com`;
    
    // 1. Register
    await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Session',
        apellidos: 'Tester',
        email: uniqueEmail,
        password: validPassword,
        confirmPassword: validPassword
      }
    });

    // 2. Get verification token
    const devResponse = await request.get(`${API_URL}/dev/last-verification-token?email=${uniqueEmail}`);
    const token = (await devResponse.json()).token;

    // 3. Verify
    await request.get(`${API_URL}/auth/verify?token=${token}`);
  });

  test('Edge Case - Should reject if no cookie provided', async ({ request }) => {
    // A fresh request context without login
    const response = await request.get(`${API_URL}/auth/me`);
    expect(response.status()).toBe(401);
  });

  test('Happy Path - Should return user data for valid session', async ({ request }) => {
    // 1. Login to get cookie
    await request.post(`${API_URL}/auth/login`, {
      data: { email: uniqueEmail, password: validPassword }
    });

    // 2. Fetch session
    const response = await request.get(`${API_URL}/auth/me`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.email).toBe(uniqueEmail);
  });

  // Note: testing expired or tampered token precisely via E2E API is tricky without manually 
  // setting bad cookies. We can test tampered cookie explicitly.
  test('Edge Case - Should reject tampered token', async ({ request }) => {
    // Provide a malformed JWT or random string as the cookie
    const response = await request.get(`${API_URL}/auth/me`, {
      headers: {
        'Cookie': 'jwt=tampered.token.data; path=/; httponly'
      }
    });
    expect(response.status()).toBe(401);
  });
});
