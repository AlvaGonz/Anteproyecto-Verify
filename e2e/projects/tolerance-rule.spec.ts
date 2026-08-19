import { test, expect } from '@playwright/test';

test.describe('Tolerance Rule Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and login
    await page.goto('/#/login');
    await page.fill('input[name="email"]', 'admin@verifinca.do');
    await page.fill('input[name="password"]', 'AdminVerifinca2026!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/dashboard');

    // Go to the tolerance rule edit page (Rule ID: 00000000-0000-0000-0000-000000000008)
    await page.goto('/#/admin/rules/00000000-0000-0000-0000-000000000008/edit');
    // Wait for the UI to load by looking for the heading
    await expect(page.locator('h1', { hasText: 'Tolerancia Superficie vs Mensura' })).toBeVisible();
  });

  test('should not contain the Bloqueante option in the alert level select', async ({ page }) => {
    // Select the options inside the dropdown
    const alertSelect = page.locator('select#rule-alert-level');
    
    // Verify that the dropdown only contains 'Informativa' and 'Advertencia'
    const options = await alertSelect.locator('option').allTextContents();
    
    // Option texts in the UI: 'Informativa' and 'Advertencia (Recomendada)'
    expect(options).toContain('Informativa');
    expect(options.some(opt => opt.includes('Advertencia'))).toBeTruthy();
    
    // Ensure 'Bloqueante' is strictly absent
    expect(options.some(opt => opt.includes('Bloqueante'))).toBeFalsy();
  });

  test('should update state automatically without needing a save button', async ({ page }) => {
    // Verify the save button is no longer present in the DOM
    await expect(page.locator('button#save-tolerance-btn')).toHaveCount(0);

    // Instead of clicking save, we toggle the state and it should auto-save
    // We expect the form to submit to the backend and show a success banner.
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/api/admin/rules/') && request.method() === 'PUT'
    );

    // Toggle the Active state
    await page.click('button#rule-active-toggle');

    // Validate the network request was sent
    const request = await requestPromise;
    expect(request).toBeTruthy();
  });

  test('should change alert level and update automatically', async ({ page }) => {
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/api/admin/rules/') && request.method() === 'PUT'
    );

    // Change the select value
    await page.selectOption('select#rule-alert-level', 'Informativa');

    // Wait for auto-save network request
    const request = await requestPromise;
    expect(request).toBeTruthy();
  });
});
