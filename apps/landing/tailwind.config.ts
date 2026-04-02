import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        estetica: {
          terracotta: "#b77359",
          terracottaHover: "#a0624a",
          olive: "#74825f",
          oliveHover: "#606d4e",
          bg: "#ffffff",
          card: "#f9f9f9",
          text: "#1a1a1a",
          muted: "#8c8c8c",
        },
      },
      fontFamily: {
        onest: ["var(--font-onest)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "14px",
      },
    },
  },
  plugins: [],
};

export default config;
