
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const publicBase = '/'; // Cambiado a '/' para evitar problemas de PWA en producción

  return {
    base: publicBase,
    server: {
      host: true,
      port: 8080,
      strictPort: true,
      allowedHosts: true,
      hmr: {
        host: '127-0-0-1.sslip.io',
        clientPort: 8080,
      },
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', 'dist/**', 'public/**']
      },
    },
    plugins: [
      react(),
      VitePWA({
        injectRegister: null,
        registerType: 'autoUpdate',
        base: publicBase,
        strategies: 'generateSW',
        includeAssets: ['img/favicon.ico', 'img/logo_solo.png', 'offline.html'],
        manifest: {
          name: 'IJF CRM',
          short_name: 'IJF CRM',
          description: 'Sistema CRM y Punto de Venta',
          start_url: publicBase,
          scope: publicBase,
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#FFFFFF',
          theme_color: '#000BC2',
          icons: [
            {
              src: `${publicBase}img/logo_solo.png`,
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: `${publicBase}img/logo_solo.png`,
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: `${publicBase}img/logo_solo.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          navigateFallback: `${publicBase}index.html`,
          navigateFallbackDenylist: [/^\/api\//],
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
          inlineWorkboxRuntime: true,
          runtimeCaching: [
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
  };
});
