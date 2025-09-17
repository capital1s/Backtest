import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.js"],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Force single thread and isolate each test to prevent hanging
    pool: "forks",
    isolate: true,
    // Disable watch mode by default to prevent hanging
    watch: false,
    // Automatic cleanup between tests
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
