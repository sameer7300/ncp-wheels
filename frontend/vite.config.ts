import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    target: 'es2020',
    sourcemap: true,
  },
  server: {
    port: 5173,
    host: true,
    cors: true,
    strictPort: true,
    hmr: {
      port: 5173,
      protocol: 'ws',
      host: 'localhost',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    proxy: {
      '/storage': {
        target: 'https://firebasestorage.googleapis.com/v0/b/ncp-wheels.appspot.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/storage/, '/o'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add CORS headers
            proxyReq.setHeader('Origin', 'http://localhost:5173');
            proxyReq.setHeader('Access-Control-Request-Method', req.method || '');
            if (req.headers['access-control-request-headers']) {
              proxyReq.setHeader(
                'Access-Control-Request-Headers',
                req.headers['access-control-request-headers']
              );
            }
          });
        },
      },
      '/firebase-storage': {
        target: 'https://firebasestorage.googleapis.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/firebase-storage/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Copy original headers
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Add CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
          });
        },
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Origin', 'http://localhost:5173');
            proxyReq.setHeader('Access-Control-Request-Method', req.method || '');
            if (req.headers['access-control-request-headers']) {
              proxyReq.setHeader(
                'Access-Control-Request-Headers',
                req.headers['access-control-request-headers']
              );
            }
          });
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
})
