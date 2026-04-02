import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FFECCC',
          50: '#FFFDF7',
          100: '#FFF8EC',
          200: '#FFECCC',
          300: '#FFE0AA',
          400: '#FFD488',
          500: '#FFC866',
        },
        dark: {
          DEFAULT: '#020100',
          50: '#3a3835',
          100: '#2a2825',
          200: '#1a1815',
          300: '#0e0c0a',
          400: '#020100',
        },
        brown: {
          DEFAULT: '#774936',
          light: '#a06548',
          dark: '#5a3628',
        },
        purple: {
          DEFAULT: '#662E9B',
          light: '#8B5CF6',
          dark: '#4C1D7A',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        instrument: ['Instrument Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
