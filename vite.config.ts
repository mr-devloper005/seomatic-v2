import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

/**
 * Yeh plugin kisi bhi import ko:
 *   'vite/modulepreload-polyfill' ya 'vite/modulepreload-polyfill.js'
 * ko stub (empty module) bana deta hai, taaki JSON plugin par na atke.
 */
function stubModulePreloadPolyfill() {
  const ids = new Set([
    'vite/modulepreload-polyfill',
    'vite/modulepreload-polyfill.js',
  ])
  const VIRTUAL = '\0vite:modulepreload-polyfill-stub'
  return {
    name: 'stub-vite-modulepreload-polyfill',
    resolveId(id: string) {
      if (ids.has(id)) return VIRTUAL
      return null
    },
    load(id: string) {
      if (id === VIRTUAL) {
        // empty ESM module
        return 'export default {}'
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [react(), stubModulePreloadPolyfill()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // safety: agar direct path resolve ho to bhi stub trigger hoga
      'vite/modulepreload-polyfill.js': 'vite/modulepreload-polyfill',
    },
  },
  // esbuild/ts targets so that String.prototype.replaceAll works
  esbuild: { target: 'es2021' },
  build: {
    target: 'es2021',
    rollupOptions: {
      // explicitly ensure index.html is the entry
      input: path.resolve(__dirname, 'index.html'),
      // safety: kabhi json plugin confuse ho to external kar do
      external: ['vite/modulepreload-polyfill', 'vite/modulepreload-polyfill.js'],
    },
  },
  optimizeDeps: {
    // pre-bundling me bhi ignore karo
    exclude: ['vite/modulepreload-polyfill', 'vite/modulepreload-polyfill.js'],
  },
})
