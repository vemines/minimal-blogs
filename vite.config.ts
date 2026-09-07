import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Auto-detect GitHub repository name in GitHub Actions CI, otherwise use relative './'
const base = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : './';

// https://vite.dev/config/
export default defineConfig({
  base,
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
