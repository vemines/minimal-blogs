import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react-markdown') ||
              id.includes('remark-gfm') ||
              id.includes('rehype-raw') ||
              id.includes('rehype-slug') ||
              id.includes('rehype-sanitize') ||
              id.includes('micromark') ||
              id.includes('unist') ||
              id.includes('hast') ||
              id.includes('mdast') ||
              id.includes('vfile')
            ) {
              return 'markdown-engine';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          }
        },
      },
    },
  },
})
