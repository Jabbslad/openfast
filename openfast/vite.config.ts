import { defineConfig } from "vite";
import { execSync } from "child_process";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const commitHash = process.env.GITHUB_SHA?.slice(0, 7)
  ?? (() => { try { return execSync("git rev-parse --short HEAD").toString().trim(); } catch { return "dev"; } })();

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/openfast/" : "/",
  define: {
    __APP_VERSION__: JSON.stringify(`0.1.0-${commitHash}`),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      manifest: {
        name: "OpenFast",
        short_name: "OpenFast",
        description: "Privacy-first fasting & wellness tracker",
        theme_color: "#0f0f1a",
        background_color: "#0f0f1a",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        shortcuts: [
          {
            name: "Start Fast",
            short_name: "Fast",
            url: "/",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Progress",
            short_name: "Progress",
            url: "/progress",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: true,
  },
});
