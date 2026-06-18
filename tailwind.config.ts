import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#232D4B",
        accent: "#E57200",

        background: "#F7F4EF",

        surface: "#FFFFFF",

        surfaceAlt: "#FAF8F5",

        border: "#E7E2DA",

        text: "#222222",

        muted: "#6B7280",

        success: "#0E9F6E",

        warning: "#D97706",

        danger: "#DC2626",
      },

      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },

      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,.06)",
        medium: "0 14px 40px rgba(0,0,0,.08)",
      },
    },
  },

  plugins: [],
};

export default config;
