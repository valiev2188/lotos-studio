import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm light backgrounds (feminine, airy)
        warm: '#FAF5EF',       // main bg — warm off-white
        petal: '#F2E9DF',      // secondary bg / input fills
        linen: '#EDE4D8',      // subtle borders / dividers
        // Text
        bark: '#1C1810',       // primary text (warm near-black)
        stone: '#8B7355',      // secondary text
        dust: '#B8A898',       // muted / placeholder
        // Brand accents
        terra: { DEFAULT: '#774936', light: '#9A6452', dark: '#5C3628' },
        sage:  { DEFAULT: '#7A8C6E', light: '#9AAD8E', dark: '#5E6E54' },
        // Rose accent (very soft, for badges/pills)
        rose: { DEFAULT: '#C4927A', light: '#D9B5A5', dark: '#A47060' },
        // Legacy compat
        brown: { DEFAULT: '#774936', light: '#9A6452', dark: '#5C3628' },
        cream: '#FAF5EF',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        instrument: ['Instrument Sans', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(28,24,16,0.07)',
        'card': '0 4px 24px rgba(28,24,16,0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
