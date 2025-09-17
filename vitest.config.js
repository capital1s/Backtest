import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFilesAfterEnv: ["./vitest-setup.js", "./msw-test-setup.js"],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Force single thread and isolate each test
    pool: "forks",
    isolate: true,
    // Automatic cleanup between tests
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
