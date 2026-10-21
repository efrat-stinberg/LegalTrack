import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Libraries that change rarely go into their own files, so the browser keeps them cached
// across deploys; recharts is only needed by the reports page and loads with it.
const vendorChunks: Record<string, string[]> = {
  react: ['react', 'react-dom', 'react-router', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
  mui: ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
}

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          for (const [chunk, packages] of Object.entries(vendorChunks)) {
            if (packages.some((pkg) => id.includes(`/node_modules/${pkg}/`))) return chunk
          }
          return undefined
        },
      },
    },
  },
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
