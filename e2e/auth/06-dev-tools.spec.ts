import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';

test.describe('06 - Dev Tools', () => {
  let uniqueEmail: string;

  test.beforeAll(async ({ request }) => {
    uniqueEmail = `devtools_test_${Date.now()}@example.com`;
    
    // Register a user
    await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'DevTools',
        apellidos: 'Tester',
        email: uniqueEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      }
    });
  });

  test('Happy Path - Should return token for unverified user', async ({ request }) => {
    const response = await request.get(`${API_URL}/dev/last-verification-token?email=${uniqueEmail}`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.token).toBeTruthy();
    expect(data.email).toBe(uniqueEmail);
  });

  test('Edge Case - Should return 400 for missing email param', async ({ request }) => {
    const response = await request.get(`${API_URL}/dev/last-verification-token`);
    expect(response.status()).toBe(400);
  });

  test('Edge Case - Should return 404 for non-existent email', async ({ request }) => {
    const response = await request.get(`${API_URL}/dev/last-verification-token?email=does-not-exist@example.com`);
    expect(response.status()).toBe(404);
  });

  test('Edge Case - Should return null token or info for already-verified user', async ({ request }) => {
    // Get token
    const devResponse = await request.get(`${API_URL}/dev/last-verification-token?email=${uniqueEmail}`);
    const token = (await devResponse.json()).token;

    // Verify
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    // Call dev tools again
    const postVerifyResponse = await request.get(`${API_URL}/dev/last-verification-token?email=${uniqueEmail}`);
    expect(postVerifyResponse.ok()).toBeTruthy();
    const data = await postVerifyResponse.json();
    
    // Assuming our controller returns Ok(new { Message = "...", EmailVerificado = true }) when token is null
    expect(data.token).toBeUndefined(); // or null depending on your JSON serialization
    expect(data.message).toContain('no verification token');
    expect(data.emailVerificado).toBe(true);
  });
});
