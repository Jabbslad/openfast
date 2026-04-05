import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0f0f1a",
          800: "#1a1a2e",
          700: "#2a2a4a",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
