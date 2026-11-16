import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // In dev the API runs on :3110 with AUTH_DISABLED=true; in production both share one origin (ADR 0002).
  server: { port: 5173, proxy: { '/api': 'http://localhost:3110' } },
  build: { outDir: 'dist', sourcemap: false },
  test: { environment: 'jsdom', setupFiles: ['./src/testing/setup.ts'], include: ['src/**/*.test.tsx'] },
});
