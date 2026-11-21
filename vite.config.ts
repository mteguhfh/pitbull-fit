import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // relative base so the build works on any host/subpath (GitHub Pages, Capacitor, file://)
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
});
