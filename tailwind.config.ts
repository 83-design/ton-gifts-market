import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: 'rgba(14, 10, 11, 0.78)',
        'obsidian-solid': '#0E0A0B',
        ruby: {
          950: '#450A0A',
          900: '#7F1D1D',
          800: '#991B1B',
          700: '#B91C1C',
        },
        pearl: '#F4F4F5',
        ash: '#8A8A93',
        cosmos: '#050507',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backdropBlur: {
        md: '12px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
