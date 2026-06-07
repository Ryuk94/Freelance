/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        obsidian: {
          950: '#050505',
          900: '#0a0a0a',
          800: '#141414',
          700: '#1f1f1f'
        }
      }
    }
  },
  plugins: []
};
