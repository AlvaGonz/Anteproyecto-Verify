/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    publicDir: 'src/frontend/web/public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/frontend/web/src'),
      },
      dedupe: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    test: {
      environment: 'jsdom',
      env: {
        VITE_API_BASE_URL: 'http://localhost:5000/api'
      }
    },
  };
});
