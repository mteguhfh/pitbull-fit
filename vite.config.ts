import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // relative base so the build works on any host/subpath (GitHub Pages, Capacitor, file://)
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  test: {
    // e2e/ belongs to Playwright, not vitest
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**']
  }
});
