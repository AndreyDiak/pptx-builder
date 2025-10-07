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
        rewrite: (path) => {
          // Заменяем /api/vk/users на /method/users.get
          if (path.startsWith('/api/vk/users')) {
            return path.replace('/api/vk/users', '/method/users.get');
          }
          // Заменяем /api/vk/messages на /method/messages.send
          if (path.startsWith('/api/vk/messages')) {
            return path.replace('/api/vk/messages', '/method/messages.send');
          }
          // Для остальных случаев просто убираем /api/vk
          return path.replace(/^\/api\/vk/, '/method');
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
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
