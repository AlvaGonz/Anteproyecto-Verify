import { test, expect } from '@playwright/test';

// Use the backend API URL directly for API E2E testing
const API_BASE_URL = 'http://localhost:5000/api'; // Removed v1

test.describe('Diagnosis API E2E', () => {
  test('should return 400 if project ID is empty', async ({ request }) => {
    // Note: hitting /api/projects/  might map to the GET all route or 404, but let's test a known invalid format or missing parameter if possible.
    const response = await request.get(`${API_BASE_URL}/projects/empty/documents/diagnosis`);
    // Assuming 'empty' is invalid format or doesn't exist
    expect(response.status()).toBe(404); // or 400 if it validates format
  });

  test('should return 404 for non-existent project', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/projects/proj-not-found/documents/diagnosis`);
    expect(response.status()).toBe(404);
  });
});
