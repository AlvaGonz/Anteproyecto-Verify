import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';

test.describe('03 - Login Flow', () => {
  let uniqueEmail: string;
  const validPassword = 'Password123!';

  test.beforeAll(async ({ request }) => {
    // Register a new user
    uniqueEmail = `login_test_${Date.now()}@example.com`;
    
    await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Login',
        apellidos: 'Tester',
        email: uniqueEmail,
        password: validPassword,
        confirmPassword: validPassword
      }
    });
  });

  test('Edge Case - Should block login before verify', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: uniqueEmail,
        password: validPassword
      }
    });
    
    expect(response.status()).toBe(400); // 400 because not verified
    const data = await response.json();
    expect(data.succeeded).toBe(false);
  });

  test('Edge Case - Should reject non-existent email', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'nobody@example.com',
        password: validPassword
      }
    });
    expect(response.status()).toBe(400); // or 401
  });

  test('Edge Case - Should reject wrong password', async ({ request }) => {
    // We should test wrong password with an already verified user, otherwise it might just fail with "not verified"
    // Let's verify the user first
    const devResponse = await request.get(`${API_URL}/dev/last-verification-token?email=${uniqueEmail}`);
    const devData = await devResponse.json();
    const token = devData.token;
    
    await request.get(`${API_URL}/auth/verify?token=${token}`);

    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: uniqueEmail,
        password: 'WrongPassword123!'
      }
    });
    expect(response.status()).toBe(400); // or 401
  });

  test('Happy Path - Should set JWT cookie on successful login', async ({ request }) => {
    // User is already verified from previous test
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: uniqueEmail,
        password: validPassword
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const cookies = await response.headers()['set-cookie'];
    expect(cookies).toContain('jwt'); // Assumes your cookie is named 'jwt' or similar. Adjust if needed.
  });
});
