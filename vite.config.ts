import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'EvoriPlay',
        short_name: 'EvoriPlay',
        description: 'Minijogos rápidos para jogar em qualquer lugar, inclusive offline.',
        theme_color: '#17152d',
        background_color: '#f7f6ff',
        display: 'standalone',
        start_url: '/',
        lang: 'pt-BR',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }
})
