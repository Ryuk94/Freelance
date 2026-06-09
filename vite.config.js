import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const repoName = process.env.GITHUB_PAGES_REPO || 'Freelance';
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGithubPages ? `/${repoName}/` : '/';

export default defineConfig(() => {
  return {
    base: '/FreelanceOS_2/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
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
            src: `${basePath}icon-192.png`,
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: `${basePath}icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: `${basePath}pwa.svg`,
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
