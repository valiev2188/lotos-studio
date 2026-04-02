import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FFECCC', 50: '#FFF8EE', 100: '#FFECCC', 200: '#FFE0AA' },
        dark: { DEFAULT: '#020100', 100: '#1A1918', 200: '#2D2C2A', 300: '#45443F' },
        brown: { DEFAULT: '#774936', light: '#8B5E4B', dark: '#5C3829' },
        purple: { DEFAULT: '#662E9B', light: '#7E45B3', dark: '#521F82' },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        instrument: ['Instrument Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
