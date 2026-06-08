/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['"Ivy Presto Headline Thin"', '"Playfair Display"', 'Georgia', 'serif']
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem'
      },
      colors: {
        obsidian: {
          950: '#06070a',
          900: '#08090b',
          800: '#111318',
          700: '#1b1e24'
        },
        neon: {
          green: '#c4ff0e',
          red: '#f97316'
        },
        terminal: {
          teal: '#14b8a6',
          blue: '#2563eb'
        }
      }
    }
  },
  plugins: []
};
