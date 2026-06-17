import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: { colors: { sand: "#f6f3ee", ink: "#2f2a24", clay: "#7c4d2f" } } },
  plugins: []
};
export default config;
