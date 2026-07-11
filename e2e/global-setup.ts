import { request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:5000';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default async function globalSetup(): Promise<void> {
  const context = await request.newContext({ baseURL: API_BASE });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Try /health first — 200 or 404 both confirm the server is reachable
      const res = await context.get('/health', { timeout: 5000 });
      if (res.status() === 200 || res.status() === 404) {
        console.log(`\n✅  API server is UP at ${API_BASE}\n`);
        await context.dispose();
        return;
      }
      // Any other status (500, 503…) means server is up but unhealthy
      console.warn(`⚠️  /health returned ${res.status()} — treating as server down`);
    } catch (outerErr: unknown) {
      // Network-level failure: try a known API endpoint as fallback
      try {
        const fallback = await context.post('/api/auth/register', {
          data: { email: 'health-check@probe.internal' },
          timeout: 5000,
        });
        // Any HTTP response (even 400) means the server is reachable
        console.log(`\n✅  API server is UP at ${API_BASE} (fallback ${fallback.status()})\n`);
        await context.dispose();
        return;
      } catch (innerErr: unknown) {
        const msg = innerErr instanceof Error ? innerErr.message : String(innerErr);
        // Only ECONNREFUSED / socket hang up / fetch failed mean the server is truly down
        if (!msg.includes('ECONNREFUSED') && !msg.includes('socket hang up') && !msg.includes('fetch failed')) {
          console.log(`\n✅  API server is UP at ${API_BASE}\n`);
          await context.dispose();
          return;
        }
      }
    }

    if (attempt < MAX_RETRIES) {
      console.log(`⏳  Waiting for API... (attempt ${attempt}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY_MS);
    }
  }

  await context.dispose();

  console.error(`
╔══════════════════════════════════════════════════════════╗
║  ❌  BACKEND SERVER IS NOT RUNNING                        ║
║                                                           ║
║  All E2E tests WILL fail with "socket hang up".          ║
║                                                           ║
║  FIX: Start the API before running Playwright tests:     ║
║                                                           ║
║  $ dotnet run --project src\\backend\\Api\\Api.csproj    ║
║              --urls http://localhost:5000                ║
║                                                           ║
║  Wait for: "Now listening on: http://localhost:5000"     ║
║  Then re-run: npx playwright test                        ║
╚══════════════════════════════════════════════════════════╝
`);
  process.exit(1); // Hard-abort — don't run tests against a dead server
}
