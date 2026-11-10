import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/rpc': {
        target: 'https://mainnet.base.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc/, '')
      },
      '/rpc/sepolia': {
        target: 'https://sepolia.base.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc\/sepolia/, '')
      }
    }
  }
})
