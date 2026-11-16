import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// SWC compiles the decorators Nest needs (esbuild, Vitest's default, does not emit decorator metadata).
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
