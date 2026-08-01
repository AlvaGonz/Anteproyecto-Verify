const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  try {
    await page.goto('http://localhost:3000/#/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Get full body HTML
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body HTML length:', bodyHTML.length);
    console.log('Body HTML preview:', bodyHTML.substring(0, 5000));
    
    // Check for React root
    const root = await page.$('#root');
    console.log('Root element exists:', !!root);
    if (root) {
      const rootHTML = await root.innerHTML();
      console.log('Root HTML length:', rootHTML.length);
      console.log('Root HTML preview:', rootHTML.substring(0, 5000));
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await browser.close();
})();