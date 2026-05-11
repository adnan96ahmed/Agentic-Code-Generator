import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(root, "src"),
    },
  },
  test: {
    root,
    environment: "jsdom",
    globals: true,
    setupFiles: [resolve(root, "src/test-setup.ts")],
  },
});
