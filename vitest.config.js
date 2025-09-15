import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./frontend/src/__tests__/setup.js'],
    globals: true,
    testTimeout: 20000
  }
});
