import { test, expect } from '@playwright/test';

test('verify intereses view', async ({ page }) => {
  console.log("Navigating to login page...");
  await page.goto('http://localhost:3000/#/login');

  console.log("Filling login form...");
  await page.fill('input[name="email"]', 'admin@verifinca.do');
  await page.fill('input[name="password"]', 'AdminVerifinca2026!');
  await page.click('button[type="submit"]');

  console.log("Waiting for network idle...");
  await page.waitForLoadState('networkidle');

  console.log("Navigating to intereses...");
  await page.goto('http://localhost:3000/#/admin/projects?tab=intereses');
  
  console.log("Waiting for data to load...");
  await page.waitForTimeout(3000);

  const screenshotPath = 'C:\\Users\\tsrve\\.gemini\\antigravity-ide\\brain\\278f5ca9-470a-4da5-b9a4-60fbcd524c63\\intereses_proof.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`Screenshot saved to ${screenshotPath}`);
});
