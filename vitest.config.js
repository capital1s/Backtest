import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFilesAfterEnv: ["./vitest-setup.js", "./msw-test-setup.js"],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Enable parallel execution for better performance
    pool: "threads",
    poolOptions: {
      threads: {
        // Use up to 4 threads for parallel execution
        minThreads: 2,
        maxThreads: 4,
      },
    },
    // Isolate tests for reliability
    isolate: true,
    // Automatic cleanup between tests
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    // Performance monitoring
    reporters: ["default", "json"],
    outputFile: "./test-results.json",
    // Coverage configuration
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.{js,jsx,ts,tsx}",
        "**/__tests__/**",
        "**/setupTests.js",
        "**/vitest*.js",
        "**/msw*.js",
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 50,
          lines: 60,
          statements: 60,
        },
      },
    },
  },
});
