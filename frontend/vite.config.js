import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose specific env vars to client bundle (prefix with VITE_ if using Vite's default)
    'process.env.WEB_HOST': JSON.stringify(process.env.WEB_HOST),
  },
})
