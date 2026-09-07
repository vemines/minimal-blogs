import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Auto-detect GitHub repository name in GitHub Actions CI, otherwise use relative './'
const base = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : './';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'cleanup-dist-data',
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        const itemsToRemove = [
          'posts',
          '_redirects',
          '404.html',
          'posts.json',
          'posts.txt',
          'tags.json',
          'pinned.txt',
        ];
        for (const item of itemsToRemove) {
          const target = path.join(distDir, item);
          if (fs.existsSync(target)) {
            fs.rmSync(target, { recursive: true, force: true });
          }
        }
      },
    },
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
