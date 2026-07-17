const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('request', req => {
    if (req.url().includes('upload-image')) {
      console.log('>> UPLOAD REQUEST MADE to', req.url());
      console.log('   Headers:', req.headers());
    }
  });
  page.on('response', res => {
    if (res.url().includes('upload-image')) {
      console.log('<< UPLOAD RESPONSE from', res.url(), res.status());
    }
  });

  try {
    const dummyImagePath = path.join(os.tmpdir(), 'dummy-upload.jpg');
    fs.writeFileSync(dummyImagePath, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
    
    console.log("Navigating to login...");
    await page.goto(`${TARGET_URL}/#/login`);
    
    try {
      await page.waitForSelector('input[name="email"]', { timeout: 3000 });
      await page.fill('input[name="email"]', 'admin@verifinca.do');
      await page.fill('input[name="password"]', 'AdminVerifinca2026!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard*', { timeout: 5000 });
      console.log("Logged in successfully!");
    } catch (e) {
      console.log("Login form skipped or already logged in...");
    }
    
    await page.goto(`${TARGET_URL}/#/admin/projects/new`);
    console.log("Navigated to project creation...");
    
    await page.waitForSelector('text=Fotos del Proyecto', { timeout: 10000 });
    
    console.log("Uploading file to input-portada...");
    await page.setInputFiles('#input-portada', {
        name: 'dummy-upload.jpg',
        mimeType: 'image/jpeg',
        buffer: fs.readFileSync(dummyImagePath)
    });
    
    console.log("Waiting for network idle...");
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    const errorLocator = page.locator('.text-red-600.bg-red-50');
    console.log("Error after upload:", await errorLocator.count() ? await errorLocator.innerText() : 'none');

    const preview = page.locator('img[alt="Vista previa de portada"]');
    console.log("Preview image exists:", await preview.count() > 0);
    
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
})();
