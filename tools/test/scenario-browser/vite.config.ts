import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = resolve(fileURLToPath(new URL("../../..", import.meta.url)));

export default defineConfig({
  root,
  plugins: [react()],
  build: {
    target: "esnext",
    outDir: resolve(root, ".sp3-browser-dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(root, "tools/test/scenario-browser/index.html"),
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/elkjs/")) return "elk";
          if (id.includes("/node_modules/@xyflow/")) return "xyflow";
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/")) return "react";
        },
      },
    },
  },
});
