import type { Config } from 'tailwindcss';

const baseConfig: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // 60/30/10 Color System
        cream: {
          DEFAULT: '#FFECCC',
          50: '#FFF8ED',
          100: '#FFECCC',
          200: '#FFE0AA',
          300: '#FFD488',
          400: '#FFC866',
          500: '#FFBC44',
        },
        dark: {
          DEFAULT: '#020100',
          50: '#2A2520',
          100: '#1F1B17',
          200: '#14110E',
          300: '#0A0805',
          400: '#050400',
          500: '#020100',
        },
        brown: {
          DEFAULT: '#774936',
          50: '#F5EDE9',
          100: '#E6D3CA',
          200: '#C9A08C',
          300: '#AC6E52',
          400: '#8F5A41',
          500: '#774936',
          600: '#5F3A2B',
          700: '#472C20',
        },
        accent: {
          DEFAULT: '#662E9B',
          50: '#F3ECFA',
          100: '#E0CFF1',
          200: '#C19FE3',
          300: '#A270D5',
          400: '#8440C7',
          500: '#662E9B',
          600: '#52257C',
          700: '#3D1C5D',
        },
        // Semantic colors
        success: '#6DBF67',
        warning: '#F0BC5A',
        error: '#EF5959',
        info: '#5AA8F0',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['Instrument Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '16px',
        xl: '24px',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
    },
  },
};

export default baseConfig;
