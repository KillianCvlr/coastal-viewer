import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        'coastal-viewer': 'coastal-viewer/index.html'
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/photos/': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/photo/': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/surveys/': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/tags/': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
})
