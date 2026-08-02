const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  try {
    await page.goto('http://localhost:3000/#/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);
    
    // Check carousel items
    const carouselItems = await page.$$('.vf-track > div');
    console.log('Carousel items count:', carouselItems.length);
    
    if (carouselItems.length > 0) {
      // Check first item
      const firstItem = carouselItems[0];
      const itemHTML = await firstItem.innerHTML();
      console.log('First item has content:', itemHTML.length > 100);
      
      // Check for project name
      const nameEl = await firstItem.$('h3');
      if (nameEl) {
        const name = await nameEl.innerText();
        console.log('First project name:', name);
      }
      
      // Check for image
      const imgEl = await firstItem.$('img');
      if (imgEl) {
        const src = await imgEl.getAttribute('src');
        console.log('First project image src:', src?.substring(0, 80));
      }
    }
    
    // Take screenshot of carousel area
    const carouselSection = await page.$('#proyectos');
    if (carouselSection) {
      await carouselSection.screenshot({ path: 'carousel-screenshot.png' });
      console.log('Screenshot saved to carousel-screenshot.png');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await browser.close();
})();