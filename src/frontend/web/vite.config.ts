import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

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
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
            '/v1': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
