import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const PERF_MODE = process.env.PERF_MODE ?? 'dev';

/**
 * Page Navigation Performance Test
 *
 * Measures cold-start page navigation performance.
 * Production mode enforces strict thresholds; dev mode is informational.
 *
 * USAGE:
 *   # Dev mode (default)
 *   npx playwright test e2e/performance/ --project=performance
 *
 *   # Production mode
 *   cd src/frontend/web && pnpm run build && pnpm exec vite preview --port 4173
 *   PERF_MODE=production FRONTEND_URL=http://localhost:4173 npx playwright test e2e/performance/ --project=performance
 */

const THRESHOLDS: Record<string, number> = {
  dev: 15_000,
  production: 1_500,
};

// Per-page thresholds for production (API-dependent pages get more time)
const PAGE_THRESHOLDS: Record<string, number> = {
  production: {
    'Landing Page': 10_000,     // Makes API calls via useSuspenseQuery
    'Public Projects': 10_000,  // Makes API calls
    'Login': 5_000,
    'Register': 5_000,
    'Pricing': 5_000,
    'Health': 5_000,
  },
  dev: {
    'Landing Page': 15_000,
    'Public Projects': 15_000,
    'Login': 15_000,
    'Register': 15_000,
    'Pricing': 15_000,
    'Health': 15_000,
  },
};

const timeout = THRESHOLDS[PERF_MODE] ?? THRESHOLDS.dev;

async function createIsolatedContext(browser: any): Promise<BrowserContext> {
  return await browser.newContext({
    storageState: undefined,
    ignoreHTTPSErrors: true,
  });
}

async function measurePageLoad(page: Page, url: string, signal: AbortSignal, routeName: string): Promise<number | null> {
  const start = Date.now();
  const pageTimeout = PAGE_THRESHOLDS[PERF_MODE]?.[routeName] ?? timeout;
  console.log(`  [measurePageLoad] Navigating to ${url} with timeout ${pageTimeout}ms (waitUntil: load)`);
  try {
    // Wait for 'load' event (all resources loaded) instead of just 'domcontentloaded'
    await page.goto(url, { waitUntil: 'load', timeout: pageTimeout });
    // Additional wait for React to hydrate - wait for body to have content
    await page.waitForFunction(() => document.body.innerHTML.length > 100, { timeout: 5000 });
    const elapsed = Date.now() - start;
    console.log(`  [measurePageLoad] Success: ${elapsed}ms`);
    return elapsed;
  } catch (e) {
    if (signal.aborted) return null;
    // ponytail: dev mode is slow; don't fail the whole suite for one timeout
    console.warn(`  TIMEOUT after ${Date.now() - start}ms — page may be API-dependent`);
    console.warn(`  Error: ${e}`);
    return null;
  }
}

test.describe('Page Navigation Performance', () => {
  test('Cold start load times', async ({ browser }) => {
    const routes: { path: string; name: string; skipDev?: boolean }[] = [
      { path: '/#/', name: 'Landing Page' },
      { path: '/#/projects', name: 'Public Projects', skipDev: true },
      { path: '/#/login', name: 'Login' },
      { path: '/#/register', name: 'Register' },
      { path: '/#/plans', name: 'Pricing' },
      { path: '/#/health', name: 'Health' },
    ];

    const ac = new AbortController();
    for (const route of routes) {
      if (PERF_MODE === 'dev' && route.skipDev) {
        console.log(`[dev] ${route.name}: SKIPPED (API-dependent)`);
        continue;
      }

      const context = await createIsolatedContext(browser);
      const page = await context.newPage();

      const elapsed = await measurePageLoad(page, FRONTEND_URL + route.path, ac.signal, route.name);
      if (elapsed !== null) {
        console.log(`[${PERF_MODE}] ${route.name}: ${elapsed}ms`);
      }

      await context.close();

      if (PERF_MODE === 'production') {
        const pageTimeout = PAGE_THRESHOLDS[PERF_MODE]?.[route.name] ?? timeout;
        expect(elapsed, `${route.name} — expected < ${pageTimeout}ms, got ${elapsed}ms`).toBeLessThan(pageTimeout);
      }
    }
  });
});
