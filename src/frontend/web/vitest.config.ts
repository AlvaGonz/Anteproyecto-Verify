import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Use 'threads' pool instead of 'forks' (default on pnpm workspaces on Windows)
    // 'forks' causes EPERM/UNKNOWN spawn errors due to child_process.fork() restrictions on Windows
    pool: 'threads',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
});
