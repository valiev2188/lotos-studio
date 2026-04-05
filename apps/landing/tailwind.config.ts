import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lotos: {
          cream:       "#FFECCC",
          surface:     "#FFF5E0",
          white:       "#FFFFFF",
          brown:       "#774936",
          brownHover:  "#5e3828",
          brownLight:  "#f5ece7",
          purple:      "#662E9B",
          purpleHover: "#521f82",
          purpleLight: "#f3ecfb",
          text:        "#2C1810",
          muted:       "#7a6258",
        },
      },
      fontFamily: {
        syne:       ["var(--font-syne)", "sans-serif"],
        instrument: ["var(--font-instrument)", "sans-serif"],
      },
      borderRadius: {
        "2xl": "14px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
