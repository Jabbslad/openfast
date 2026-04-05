import { defineConfig } from "vite";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const commitHash = process.env.GITHUB_SHA?.slice(0, 7)
  ?? (() => { try { return execSync("git rev-parse --short HEAD").toString().trim(); } catch { return "dev"; } })();

// Read version from changelog (source of truth)
const changelogSrc = readFileSync("src/content/changelog.ts", "utf-8");
const versionMatch = changelogSrc.match(/version:\s*"([^"]+)"/);
const version = versionMatch ? versionMatch[1] : "0.0.0";

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/openfast/" : "/",
  define: {
    __APP_VERSION__: JSON.stringify(`${version}-${commitHash}`),
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
        background_color: "#0a0a14",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
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
