import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../backend/public',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'vendor-react'
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('@dnd-kit')) return 'vendor-dnd'
            return 'vendor'
          }

          // Feature-based chunks (combining related functionality)
          if (id.includes('/components/')) {
            if (id.includes('Schedule') || id.includes('Employee')) {
              return 'feature-schedule'
            }
            if (id.includes('Draw')) {
              return 'feature-schedule' // Combining with schedule since they're related
            }
            return 'components'
          }

          // Core app code (combining smaller chunks)
          if (id.includes('/services/') || id.includes('/store/')) {
            return 'core'
          }

          // Pages
          if (id.includes('/pages/')) {
            return 'pages'
          }

          return 'index'
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    cssMinify: true,
    cssCodeSplit: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
