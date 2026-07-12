import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';

test.describe('01 - Register Flow', () => {
  const uniqueEmail = `testuser_${Date.now()}_${Math.random().toString(36).slice(2, 9)}@example.com`;
  const validPassword = 'Password123!';
  const validUserData = {
    nombre: 'Test',
    apellidos: 'User',
    email: uniqueEmail,
    password: validPassword,
    confirmPassword: validPassword
  };

  test('Happy Path - Should register a new user successfully', async ({ request }) => {
    const uniqueEmail = `testuser_${Date.now()}_${Math.random().toString(36).slice(2, 9)}@example.com`;
    const validUserData = {
      nombre: 'Test',
      apellidos: 'User',
      email: uniqueEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };

    const response = await request.post(`${API_URL}/auth/register`, {
      data: validUserData
    });
    
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.isSuccess).toBeTruthy();
  });

  test('Edge Case - Should reject duplicate email', async ({ request }) => {
    const uniqueEmail = `testuser_${Date.now()}_${Math.random().toString(36).slice(2, 9)}@example.com`;
    const validUserData = {
      nombre: 'Test',
      apellidos: 'User',
      email: uniqueEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };

    // First attempt to register
    await request.post(`${API_URL}/auth/register`, {
      data: validUserData
    });

    // Attempt to register same email again
    const response = await request.post(`${API_URL}/auth/register`, {
      data: validUserData
    });
    
    expect(response.status()).toBe(400); // Or whichever status your API returns for duplicate
  });

  test('Edge Case - Should reject missing fields', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: `missing_${Date.now()}@example.com`
      } // Missing nombre, apellidos, password
    });
    
    expect(response.status()).toBe(400);
  });

  test('Edge Case - Should reject invalid email format', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Test',
        apellidos: 'User',
        email: 'invalid-email-format',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      }
    });
    
    expect(response.status()).toBe(400);
  });

  test('Edge Case - Should reject weak password', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        nombre: 'Test',
        apellidos: 'User',
        email: `weak_${Date.now()}@example.com`,
        password: '123',
        confirmPassword: '123'
      }
    });
    
    expect(response.status()).toBe(400);
  });
});
