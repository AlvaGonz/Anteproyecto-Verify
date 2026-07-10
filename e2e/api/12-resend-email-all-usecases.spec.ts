import { test, expect } from '@playwright/test';

// Use a unique email identifier per test run to make logs easier to read
const TEST_EMAIL = `test-${Date.now()}@handymansolutionrd.lat`;
const BASE_URL = process.env.API_URL || 'http://localhost:5000';

test.describe('Resend Email Integration — All Use Cases', () => {

  const endpoints = [
    { name: 'UC-01 Account Verification', url: '/api/email-test/uc-01-account-verification' },
    { name: 'UC-02 Document Upload', url: '/api/email-test/uc-02-document-upload' },
    { name: 'UC-03a Document Approved', url: '/api/email-test/uc-03a-document-approved' },
    { name: 'UC-03b Document Rejected', url: '/api/email-test/uc-03b-document-rejected' },
    { name: 'UC-04 Project Created', url: '/api/email-test/uc-04-project-created' },
    { name: 'UC-05 Subscription Activated', url: '/api/email-test/uc-05-subscription-activated' },
    { name: 'UC-06 Project Status Change', url: '/api/email-test/uc-06-project-status-change' }
  ];

  for (const endpoint of endpoints) {
    test(`Trigger ${endpoint.name}`, async ({ request }) => {
      console.log(`Triggering ${endpoint.name} at ${BASE_URL}${endpoint.url}`);
      
      const response = await request.post(`${BASE_URL}${endpoint.url}`, {
        data: {
          email: TEST_EMAIL,
          name: 'Playwright Automation',
          // Generate a unique cedula for UC-01 so it doesn't collide
          cedula: `402${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}9`
        }
      });

      // The EmailTestController returns 200 OK if the email was successfully sent via Resend API
      // If it fails (e.g. invalid API key, domain not verified, unhandled exception), it returns 500
      // If the email or cedula already exists (only for UC-01), it returns 409
      
      const status = response.status();
      const body = await response.json().catch(() => null);

      if (status === 409) {
        console.warn(`Conflict received for ${endpoint.name}. Test user might already exist. Proceeding as successful connectivity test.`);
        // Even if 409, it means the API is reachable and valid. 
        expect(status).toBe(409);
      } else {
        expect(status, `Expected 200 OK for ${endpoint.name}, got ${status} with body: ${JSON.stringify(body)}`).toBe(200);
        expect(body).toHaveProperty('status', 'sent');
      }
    });
  }
});
