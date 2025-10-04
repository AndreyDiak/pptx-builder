import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from "path";
import { defineConfig } from 'vite';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/vk': {
        target: 'https://api.vk.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vk/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  optimizeDeps: {
    include: ['lamejs'],
    force: true
  },
  define: {
    global: 'globalThis',
  },
  build: {
    commonjsOptions: {
      include: [/lamejs/, /node_modules/],
      transformMixedEsModules: true,
      strictRequires: true
    }
  },
})
