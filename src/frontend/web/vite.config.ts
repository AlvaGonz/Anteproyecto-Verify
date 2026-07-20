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
                cookieDomainRewrite: 'localhost',
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
