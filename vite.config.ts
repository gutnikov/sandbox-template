import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src/client', import.meta.url)) },
  },
  server: {
    port: 5173,
    // В разработке фронт живёт на Vite, а API — в соседнем процессе.
    proxy: { '/api': 'http://localhost:3000', '/healthz': 'http://localhost:3000' },
  },
  build: { outDir: 'dist/client', emptyOutDir: true },
})
