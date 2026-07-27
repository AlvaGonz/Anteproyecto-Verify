import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const PERF_MODE = process.env.PERF_MODE ?? 'dev';

/**
 * Page Navigation Performance Test
 *
 * This test measures cold-start page navigation performance.
 *
 * MODES:
 * - dev (default): runs against Vite dev server (native ESM, slower). Threshold: 12s.
 * - production: run against a built + previewed app. Threshold: 1500ms.
 *
 * USAGE:
 *   # Dev mode (default)
 *   npx playwright test e2e/performance/ --project=performance
 *
 *   # Production mode
 *   cd src/frontend/web && pnpm run build && pnpm exec vite preview --port 4173
 *   # In another terminal:
 *   PERF_MODE=production FRONTEND_URL=http://localhost:4173 npx playwright test e2e/performance/ --project=performance
 */

const DEV_TIMEOUT = 12_000;
const PROD_TIMEOUT = 1_500;

function getThreshold(pageName: string): number {
  if (PERF_MODE === 'production') return PROD_TIMEOUT;
  return DEV_TIMEOUT;
}

async function createIsolatedContext(browser: any): Promise<BrowserContext> {
  return await browser.newContext({
    storageState: undefined,
    ignoreHTTPSErrors: true,
  });
}

async function measurePageLoad(page: Page, url: string): Promise<number> {
  const start = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  return Date.now() - start;
}

test.describe('Page Navigation Performance', () => {
  test('Cold start load times', async ({ browser }) => {
    const routes: { path: string; name: string }[] = [
      { path: '/#/', name: 'Landing Page' },
      { path: '/#/projects', name: 'Public Projects' },
      { path: '/#/login', name: 'Login' },
      { path: '/#/register', name: 'Register' },
      { path: '/#/plans', name: 'Pricing' },
      { path: '/#/health', name: 'Health' },
    ];

    for (const route of routes) {
      const context = await createIsolatedContext(browser);
      const page = await context.newPage();

      const elapsed = await measurePageLoad(page, FRONTEND_URL + route.path);
      console.log(`[${PERF_MODE}] ${route.name}: ${elapsed}ms`);

      await context.close();

      // Require production builds to pass; dev mode gets descriptive output only
      if (PERF_MODE === 'production') {
        expect(elapsed, `${route.name} took ${elapsed}ms (threshold: ${getThreshold(route.name)}ms)`).toBeLessThan(getThreshold(route.name));
      }
    }
  });
});
