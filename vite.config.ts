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
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom')) return 'vendor-react';
            if (id.includes('node_modules/react')) return 'vendor-react';
            if (id.includes('node_modules/framer-motion')) return 'vendor-animation';
            if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
            if (id.includes('node_modules/leaflet')) return 'vendor-map';
            if (id.includes('node_modules/i18next')) return 'vendor-i18n';
            if (id.includes('node_modules/@tanstack/react-query')) return 'vendor-query';
            if (id.includes('node_modules/axios')) return 'vendor-http';
            if (id.includes('node_modules')) return 'vendor-other';
          },
        },
      },
    },
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
