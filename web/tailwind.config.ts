import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pine: { 900: '#0d2b26', 800: '#123a33', 700: '#1a4d44' },
        aegean: { 600: '#0e7c7b', 500: '#14918f', 100: '#e0f2f1' },
        sand: '#f7f6f2',
        navy: { DEFAULT: '#16294D', deep: '#0F1C33', mist: '#EAF0F6' },
        brass: { DEFAULT: '#C9A55C', soft: '#F0E6D2' },
        shell: '#F7F5F0'
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Karla', 'system-ui', 'sans-serif']
      },
      borderRadius: { arch: '9999px 9999px 0 0' }
    }
  },
  plugins: []
} satisfies Config;
