import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const artifactDir = 'C:/Users/tsrve/.gemini/antigravity-ide/brain/9ba3c6f8-f813-439a-a7b1-55ddfffca2c8';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  console.log('Launching browser (using system chrome)...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  } catch (e) {
    console.log('System chrome not found, trying system msedge...');
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  }
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`API ERROR RESPONSE: ${response.url()} returned status ${response.status()}`);
    }
  });

  console.log('Navigating to register page...');
  await page.goto('http://localhost:3000/#/register');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_1_register_page.png') });

  console.log('Filling out registration form...');
  await page.fill('#nombre', 'see');
  await page.fill('#apellido', 'black');
  await page.fill('#email', 'see_black0@gmail.com');
  await page.fill('#telefono', '8095550199');
  await page.fill('#cedula', '40200000004');
  await page.fill('#password', '@Rvl7851819100');

  console.log('Checking terms checkbox...');
  await page.check('input[type="checkbox"]');
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_2_register_filled.png') });

  console.log('Submitting registration form...');
  await page.click('button[type="submit"]');

  console.log('Waiting for redirection to login page...');
  await page.waitForURL('**/login', { timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('Registration successful, reached login page:', page.url());
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_3_login_after_register.png') });

  console.log('Filling out login form...');
  await page.fill('#email', 'see_black0@gmail.com');
  await page.fill('#password', '@Rvl7851819100');
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_4_login_filled.png') });

  console.log('Submitting login form...');
  await page.click('button[type="submit"]');

  console.log('Waiting for redirection to admin dashboard...');
  await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
  await page.waitForTimeout(3000); // Allow dashboard layout to load completely
  console.log('Login successful, reached dashboard:', page.url());
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_5_dashboard_logged_in.png') });

  await browser.close();
  console.log('Test completed successfully!');
})().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
