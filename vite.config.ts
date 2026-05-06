
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
  base: '/app/',
  
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
      },
      includeAssets: ['img/favicon.ico', 'img/logo_solo.png', 'offline.html'],
      manifest: {
        name: 'IJF CRM',
        short_name: 'IJF CRM',
        description: 'Sistema CRM y Punto de Venta',
        start_url: '/app/',
        scope: '/app/',
        theme_color: '#FF7A1A',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'img/logo_solo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/logo_solo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'img/logo_solo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
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
