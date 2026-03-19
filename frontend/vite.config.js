import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Forces a single React instance even if deps get duplicated
    dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom'],
  },
})
