
import { defineConfig } from "vite";
// Prefer Babel-based React plugin to avoid SWC native binding issues on Windows
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // In development we use relative base for Vite dev server.
  // In production we deploy under Laravel public/app, so use absolute base "/app/".
  base: './',
  
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      // Direct access to Vite dev server under sslip domains
      host: '127-0-0-1.sslip.io',
      clientPort: 8080,
    },
    watch: {
      // Ignore common folders that may be written to by plugins or external tools
      // to avoid triggering Vite's file watcher and restarting the dev server.
      ignored: ['**/node_modules/**', '**/.git/**', 'dist/**', 'public/**']
    },
  },
  plugins: [
    react(),
    // componentTagger disabled to avoid injecting external scripts (e.g., gptengineer)
    // which can conflict with Laravel hosting under /app.
    VitePWA({
      strategies: 'injectManifest',
      injectManifest: {
        swSrc: 'public/sw.js',
        swDest: 'dist/sw.js',
        injectionPoint: undefined
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Venta Simplify',
        short_name: 'VentaApp',
        description: 'Sistema de Punto de Venta',
        theme_color: '#f8e109',
        background_color: '#d5d2b4',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(js|css|png|jpg|jpeg|svg|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache',
            }
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      // Use process.cwd() to avoid __dirname in ESM configs
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
}));
