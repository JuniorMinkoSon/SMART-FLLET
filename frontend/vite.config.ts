import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Cible du backend Spring Boot en développement.
const BACKEND = process.env.VITE_BACKEND_ORIGIN || 'http://localhost:9090'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // `/api/...` est relayé tel quel : le backend expose déjà ses routes
      // sous `/api` (ex. /api/auth/login). Pas de réécriture, pas de CORS.
      '/api': {
        target: BACKEND,
        changeOrigin: true,
      },
    },
  },
})
