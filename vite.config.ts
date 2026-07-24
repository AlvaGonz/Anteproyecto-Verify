/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const apiTarget = process.env.DOCKER_CONTAINER === 'true'
    ? 'http://api:8080'
    : 'http://localhost:5000';

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
      port: 3000,
      host: process.env.NODE_ENV === 'development' ? '0.0.0.0' : 'localhost',
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: false,
          secure: false,
        },
      },
    },
    test: {
      environment: 'jsdom',
      env: {
        VITE_API_BASE_URL: 'http://localhost:5000/api'
      }
    },
  };
});
