import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'/',
  server: {
    host: 'localhost', // Change to '0.0.0.0' if you want external access
    port: 3001,
    fs: {
      allow: ['..']    // This allows serving files from outside the project root
    }// Change to your desired port (default is 5173)
  },
   build: {
    rollupOptions: {
      output: {
        manualChunks: {
          tinymce: ['tinymce']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})