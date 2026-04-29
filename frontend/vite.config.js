import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        // Rewrite: /api/pgs  →  /pghub/php-backend/api/pgs
        rewrite: (path) => path.replace(/^\/api/, '/pghub/php-backend/api')
      },
      '/pghub/php-backend/uploads': {
        target: 'http://localhost',
        changeOrigin: true
      }
    }
  }
})
