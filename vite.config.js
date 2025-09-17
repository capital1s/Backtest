import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFilesAfterEnv: ["./minimal-setup-test.js", "./msw-test-setup.js"],
    // You can add more Vitest options here as needed
  },
});
