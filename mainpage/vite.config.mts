import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    proxy: {
      '/config': 'http://localhost:8080',
      '/sub':      'http://localhost:8080',
      '/provider': 'http://localhost:8080',
      '/proxy':    'http://localhost:8080',
    },
  },
})