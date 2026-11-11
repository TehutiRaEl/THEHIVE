import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // vite-plugin-svgr removed: registered here but never declared in
  // package.json, and zero .svg-as-React-component imports exist anywhere
  // in src/ — a clean `npm install` could never resolve it, breaking every
  // build (both `build` and `build:app`) from a fresh checkout regardless
  // of any other change. Re-add both the dependency and this plugin
  // together if SVG-as-component imports are ever actually needed.
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/assets/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    host: true,
    // No dev proxy: nothing in src/ calls /api or /ws (the socket uses
    // /v11/ws, same-origin). The old proxy pointed at Jasper-era localhost
    // ports that run nowhere.
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          d3: ['d3'],
          // phaser: used via dynamic import() in PhaserScene.tsx — keep a dedicated chunk
          // so the main OS bundle does not pay for it until a Phaser surface loads.
          phaser: ['phaser'],
          // socket.io-client removed 2026-07-29 (PR #132): no imports in frontend/src;
          // dead manualChunk previously listed a package not in package.json.
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  define: {
    // Default to '' (same-origin), NOT localhost. This define overrides the fallback in
    // src/utils/constants.ts, so a localhost default here hardwired the DEPLOYED bundle to
    // http://localhost:8000 — on a visitor's phone that fetched their own non-existent
    // localhost, making the whole app read OFFLINE / 0 agents (PR_LESSONS: a build-time
    // constant silently breaking the shipped result). Empty = talk to whatever origin
    // serves the app (the Worker, where /v11 is live). Dev sets VITE_API_BASE_URL to
    // the live Worker origin (see frontend/README.md); without it, dev reads
    // same-origin and the Vite dev server has no /v11.
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
    'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(process.env.VITE_SENTRY_DSN || ''),
  },
})
