import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { lazy } from 'react'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../backend/public',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Removes console.logs
        drop_debugger: true // Removes debugger statements
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-redux'],
          dnd: ['@dnd-kit/core'],
          ui: ['./src/components/ui/button', './src/components/ui/table', './src/components/ui/select'],
          schedule: ['./src/components/ScheduleTable', './src/components/EmployeesList']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
