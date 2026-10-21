import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pages are lazy-loaded (see App.tsx), which already keeps the first download small.
// Don't hand-split node_modules with manualChunks: putting MUI/emotion in their own chunk
// broke the production build ("Cannot access ... before initialization", blank page).
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://legaltrack-server.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
