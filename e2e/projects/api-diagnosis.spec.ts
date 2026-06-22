import { test, expect } from '@playwright/test';

// Use the backend API URL directly for API E2E testing
const API_BASE_URL = 'http://localhost:5000/api'; // Removed v1

test.describe('Diagnosis API E2E', () => {
  test('should return 401 if unauthenticated even if project ID is empty', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/projects/empty/documents/diagnosis`);
    expect(response.status()).toBe(401); 
  });

  test('should return 401 if unauthenticated even for non-existent project', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/projects/proj-not-found/documents/diagnosis`);
    expect(response.status()).toBe(401);
  });
});
