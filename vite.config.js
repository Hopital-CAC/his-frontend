import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

export default defineConfig(({command, mode})=>{
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET?.trim() || 'http://127.0.0.1:4000'
  if(command === 'serve' && !env.VITE_PROXY_TARGET){
    throw new Error('VITE_PROXY_TARGET is not specified in .env file. Please specify the proxy target for development server.')
  }

  const proxyOrigin = proxyTarget ? new URL(proxyTarget).origin : ''
  return{
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),

    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),

    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),

    command === 'serve' ? vueDevTools() : null,
  ].filter(Boolean),

  base: '/',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,

    hmr: {
      overlay: false,
    },

    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },

      '/socket.io': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },

  preview: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },

      '/socket.io': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }

            if (id.includes('firebase')) {
              return 'firebase'
            }

            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf'
            }

            return 'vendor'
          }
        },
      },
    },
  },

  optimizeDeps: {
    include: ['vue'],
  },

  test: {
    include: [
      'tests/**/*.spec.js',
      'src/__tests__/**/*.spec.js',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.patch-backups/**',
      '**/*-review/**',
    ],
  },
}
})