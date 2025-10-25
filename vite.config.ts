import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // in case kahin .js extension ke sath import reh gaya ho
      'vite/modulepreload-polyfill.js': 'vite/modulepreload-polyfill',
    },
  },
  build: {
    target: 'es2021',
  },
  esbuild: {
    target: 'es2021',
  },
})
