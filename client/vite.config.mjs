import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import galleryDevPlugin from "./vite-plugin-gallery-dev.mjs";

export default defineConfig({
  plugins: [react(), tailwindcss(), galleryDevPlugin()],
  server: {
    port: 3000,
    watch: {
      ignored: ["**/originals/**", "**/public/assets/photos/**"],
    },
    proxy: {
      "/api": "http://127.0.0.1:3001",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "/src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
