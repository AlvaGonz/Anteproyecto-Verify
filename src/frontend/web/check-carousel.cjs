const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  try {
    await page.goto('http://localhost:3000/#/', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait a bit for Suspense to resolve
    await page.waitForTimeout(3000);
    
    // Take full page screenshot
    await page.screenshot({ path: 'landing-full.png', fullPage: true });
    
    // Check if the carousel section exists
    const carouselSection = await page.$('#proyectos');
    console.log('Carousel section (#proyectos) exists:', !!carouselSection);
    
    if (carouselSection) {
      const isVisible = await carouselSection.isVisible();
      console.log('Carousel section is visible:', isVisible);
      
      const box = await carouselSection.boundingBox();
      console.log('Carousel section bounding box:', box);
      
      const innerHTML = await carouselSection.innerHTML();
      console.log('Carousel section innerHTML length:', innerHTML.length);
      console.log('Carousel section innerHTML preview:', innerHTML.substring(0, 500));
    }
    
    // Check for any Suspense fallback or loading states
    const suspenseFallback = await page.$('[data-testid="suspense-fallback"], .animate-pulse');
    console.log('Suspense fallback found:', !!suspenseFallback);
    
    // Check for error boundaries
    const errorBoundary = await page.$('[data-testid="error-boundary"]');
    console.log('Error boundary found:', !!errorBoundary);
    
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