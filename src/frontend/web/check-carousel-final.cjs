const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  try {
    await page.goto('http://localhost:3000/#/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Check for carousel section
    const carouselSection = await page.$('#proyectos');
    console.log('Carousel section (#proyectos) exists:', !!carouselSection);
    
    if (carouselSection) {
      const isVisible = await carouselSection.isVisible();
      console.log('Carousel section is visible:', isVisible);
      
      const box = await carouselSection.boundingBox();
      console.log('Carousel section bounding box:', box);
      
      const innerHTML = await carouselSection.innerHTML();
      console.log('Carousel section innerHTML length:', innerHTML.length);
    }
    
    // Check for Suspense fallback
    const suspenseFallback = await page.$('.animate-pulse');
    console.log('Suspense fallback found:', !!suspenseFallback);
    
    // Get all sections
    const sections = await page.$$('section');
    console.log('All sections found:', sections.length);
    for (const s of sections) {
      const id = await s.getAttribute('id');
      const cls = await s.getAttribute('class');
      console.log('  Section:', id, cls?.substring(0, 80));
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  await browser.close();
})();