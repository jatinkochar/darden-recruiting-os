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
        compass: {
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          navy: "#232D4B",
          "navy-dark": "#151C33",
          orange: "#E57200",
          "orange-dark": "#B85C00",
          blue: "#005587",
          text: "#172033",
          muted: "#667085",
          border: "#E4E7EC",
        },
        sand: "#F8FAFC",
        ink: "#172033",
        clay: "#E57200",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(16,24,40,0.06)",
        medium: "0 12px 32px rgba(16,24,40,0.08)",
        glow: "0 18px 50px rgba(35,45,75,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
