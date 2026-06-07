/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['"Ivy Presto Headline Thin"', '"Playfair Display"', 'Georgia', 'serif']
      },
      colors: {
        obsidian: {
          950: '#000000',
          900: '#050505',
          800: '#101010',
          700: '#1a1a1a'
        },
        neon: {
          green: '#c4ff0e',
          red: '#ff3b30'
        }
      }
    }
  },
  plugins: []
};
