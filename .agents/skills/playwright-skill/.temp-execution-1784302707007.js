const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log all network requests
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  try {
    const filePayload = {
      name: 'dummy-upload.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64")
    };
    
    console.log("Navigating to login...");
    await page.goto(`${TARGET_URL}/#/login`); // SPA Hash router is used
    
    // Login form
    try {
      await page.waitForSelector('input[name="email"]', { timeout: 5000 });
      await page.fill('input[name="email"]', 'admin@verifinca.do');
      await page.fill('input[name="password"]', 'AdminVerifinca2026!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard*', { timeout: 10000 });
      console.log("Logged in successfully!");
    } catch (e) {
      console.log("Login form skipped or already logged in...");
    }
    
    // Go to project creation
    await page.goto(`${TARGET_URL}/#/admin/projects/new`);
    console.log("Navigated to project creation...");
    
    // Wait for the "Fotos del Proyecto" text to ensure form is loaded
    await page.waitForSelector('text=Fotos del Proyecto', { timeout: 15000 });
    
    console.log("Uploading file to input-portada...");
    
    const uploadPromise = page.waitForResponse(response => response.url().includes('/upload-image'), { timeout: 15000 });
    
    // Trigger the file upload
    await page.setInputFiles('#input-portada', filePayload);
    
    const uploadResponse = await uploadPromise;
    console.log(`Upload Response Status: ${uploadResponse.status()}`);
    
    if (uploadResponse.ok()) {
      console.log("✅ Upload SUCCESS!");
      const body = await uploadResponse.json();
      console.log("Response:", body);
    } else {
      console.log("❌ Upload FAILED!");
      const text = await uploadResponse.text();
      console.log("Error body:", text);
    }
    
    await page.waitForTimeout(2000);
    
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
})();
