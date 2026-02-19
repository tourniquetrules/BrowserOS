import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Allow clean imports like "@/core/kernel" instead of "../../core/kernel"
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Produce a single-page app bundle
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    // Vitest configuration (co-located with vite config per best practice)
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
