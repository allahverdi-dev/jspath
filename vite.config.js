import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('monaco')) return 'monaco';
            if (id.includes('supabase')) return 'supabase';
            return 'vendor';
          }
          if (id.includes('/src/content/curriculum/')) {
            const m = id.match(/curriculum\/([^/]+)\//);
            if (m) return `content-${m[1]}`;
          }
          if (id.includes('/src/content/')) {
            const m = id.match(/content\/([^/]+)\//);
            if (m) return `content-${m[1]}`;
          }
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
});
