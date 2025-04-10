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
        pure_funcs: ['console.log', 'console.error', 'console.warn'],
        passes: 2
      },
      mangle: true
    },
    rollupOptions: {
      output: {
        // Split only non-React vendor code
        manualChunks: (id) => {
          // Keep all React and related packages in the main bundle
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('redux') || id.includes('scheduler')) {
              return null // Keep in main bundle
            }
            // Split other vendors
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd'
            }
            if (id.includes('dom-to-image')) {
              return 'vendor-image'
            }
            return 'vendor'
          }
        }
      }
    },
    target: 'esnext',
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
