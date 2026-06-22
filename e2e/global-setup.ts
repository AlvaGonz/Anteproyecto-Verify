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
      // Try /health first, fall back to a known endpoint
      const res = await context.get('/health', { timeout: 5000 });
      if (res.ok() || res.status() === 404) {
        console.log(`\n✅  API server is UP at ${API_BASE}\n`);
        await context.dispose();
        return;
      }
    } catch {
      // Any response (even error) means server is alive
      try {
        await context.post('/api/auth/register', {
          data: { email: 'health-check@probe.internal' },
          timeout: 5000,
        });
        console.log(`\n✅  API server is UP at ${API_BASE}\n`);
        await context.dispose();
        return;
      } catch (innerErr: unknown) {
        const msg = innerErr instanceof Error ? innerErr.message : String(innerErr);
        if (!msg.includes('socket hang up') && !msg.includes('ECONNREFUSED') && !msg.includes('fetch failed')) {
          // Got a real HTTP error response = server is up
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
