import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// In Docker, the API is reachable at 'api:8080' (container name + internal port)
// On host, it's 'localhost:5000'
const apiTarget = process.env.DOCKER_CONTAINER === 'true'
    ? 'http://api:8080'
    : 'http://localhost:5000';

export default defineConfig({
    plugins: [react() as any, tailwindcss() as any],
    envDir: '../../',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined;
                    // React runtime deps must live with react-dom (fixes the
                    // vendor-other -> vendor-react circular chunk warning)
                    if (id.includes('node_modules/react-dom')
                        || id.includes('node_modules/scheduler')
                        || id.includes('node_modules/use-sync-external-store')
                        || id.includes('node_modules/react-is')) return 'vendor-react';
                    if (id.includes('node_modules/framer-motion')
                        || id.includes('node_modules/motion-dom')
                        || id.includes('node_modules/motion-utils')) return 'vendor-animation';
                    if (id.includes('node_modules/@stripe')) return 'vendor-stripe';
                    if (id.includes('node_modules/zod')
                        || id.includes('node_modules/react-hook-form')
                        || id.includes('node_modules/@hookform')) return 'vendor-forms';
                    if (id.includes('node_modules/@react-oauth')) return 'vendor-oauth';
                    if (id.includes('node_modules/@tanstack')) return 'vendor-query';
                    if (id.includes('node_modules/leaflet')) return 'vendor-map';
                    if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
                    if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) return 'vendor-i18n';
                    if (id.includes('node_modules/axios')) return 'vendor-http';
                    if (id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) return 'vendor-utils';
                    if (id.includes('node_modules/prop-types')) return 'vendor-react';
                    if (id.includes('node_modules/react')) return 'vendor-react';
                    return 'vendor-other';
                },
            },
        },
    },
    server: {
        port: 3000,
        host: process.env.NODE_ENV === 'development' ? '0.0.0.0' : 'localhost',
        watch: {
            usePolling: true,
        },
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
        },
        proxy: {
            '/api': {
                target: apiTarget,
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Proxying:', req.method, req.url, '->', apiTarget + req.url);
                    });
                },
            },
        },
    },
});
