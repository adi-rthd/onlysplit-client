import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Auto-update the service worker when a new build is deployed.
      registerType: 'autoUpdate',
      // Only generate/register the SW for production builds, so `npm run dev`
      // and the Capacitor native build are unaffected.
      devOptions: {
        enabled: false,
      },
      includeAssets: ['logo.png'],
      manifest: {
        name: 'OnlySplit - Premium Expense Splitting',
        short_name: 'OnlySplit',
        description: 'Split expenses with friends and groups, the premium way.',
        theme_color: '#0D0E10',
        background_color: '#0D0E10',
        display: 'standalone',
        orientation: 'portrait',
        // Hash routing (HashRouter) means the app always boots from "/".
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precache the built static assets for offline use.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Do not let the SW cache or intercept API calls.
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
})
