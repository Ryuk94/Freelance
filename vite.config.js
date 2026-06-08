import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const repoName = process.env.GITHUB_PAGES_REPO || 'Freelance';
const isGithubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: isGithubPages ? `/${repoName}/` : './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-dom/client'],
          dexie: ['dexie', 'dexie-react-hooks'],
          vendor: ['@supabase/supabase-js', 'canvas-confetti'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'FreelanceOS',
        short_name: 'FL-OS',
        description: 'Local-first freelance business tracker',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        display_override: ['standalone', 'fullscreen', 'minimal-ui', 'browser'],
        scope: isGithubPages ? `/${repoName}/` : '/',
        start_url: isGithubPages ? `/${repoName}/` : '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ]
});
