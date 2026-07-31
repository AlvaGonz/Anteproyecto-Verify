import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';

test.describe('02 - Verify Flow', () => {
  let uniqueEmail: string;
  let verificationToken: string;

  test.beforeAll(async ({ request }) => {
    // Register a new user to test verification
    uniqueEmail = `verify_test_${Date.now()}@example.com`;
    const password = 'Password123!';
    
    const registerResponse = await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Verify',
        apellidos: 'Tester',
        email: uniqueEmail,
        password: password,
        confirmPassword: password
      }
    });
    
    if (!registerResponse.ok()) {
      const errorText = await registerResponse.text();
      console.error(`Registration failed: ${registerResponse.status()} - ${errorText}`);
    }
    expect(registerResponse.ok()).toBeTruthy();

    // Fetch the token using the dev endpoint
    const devResponse = await request.get(`${API_URL}/dev/last-verification-token?email=${uniqueEmail}`);
    
    if (!devResponse.ok()) {
      const devError = await devResponse.text();
      console.error(`Dev token fetch failed: ${devResponse.status()} - ${devError}`);
    }
    expect(devResponse.ok()).toBeTruthy();
    const devData = await devResponse.json();
    verificationToken = devData.token;
    expect(verificationToken).toBeTruthy();
  });

  test('Edge Case - Should reject empty token', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/verify`);
    expect(response.status()).toBe(400);
  });

  test('Edge Case - Should reject invalid token', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/verify?token=invalid-token-123`);
    expect(response.status()).toBe(400); // or 404 depending on API design
  });

  test('Happy Path - Should activate account with valid token', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/verify?token=${verificationToken}`);
    expect(response.ok()).toBeTruthy();
  });

  test('Edge Case - Should handle already-verified token gracefully (idempotency or error)', async ({ request }) => {
    // Use the token twice
    const response = await request.get(`${API_URL}/auth/verify?token=${verificationToken}`);
    // Might be 400 because token is cleared, or 200 idempotently. Our current implementation clears the token, so it won't find it.
    expect(response.status()).toBe(400); 
  });
});
