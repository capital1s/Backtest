import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "chart-vendor": ["react-chartjs-2"],
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dev server
  server: {
    port: 3000,
    host: "0.0.0.0",
    strictPort: true,
    hmr: {
      port: 3000,
    },
    watch: {
      usePolling: true,
    },
    cors: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.js"],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Optimize test performance
    pool: "forks",
    isolate: true,
    watch: false,
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/*.test.{js,jsx,ts,tsx}",
        "**/__tests__/**",
        "**/dist/**",
      ],
    },
  },
});
