import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isSpecificApi = env.VITE_API_URL && env.VITE_API_URL.startsWith('https://demos.godigitalalchemy.com/scorecard/backend');
  const base = isSpecificApi ? '/scorecard/admin/' : '/';

  return {
    plugins: [react()],
    base: base,
    server: {
      host: 'localhost', // Change to '0.0.0.0' if you want external access
      port: 3001,
      fs: {
        allow: ['..']    // This allows serving files from outside the project root
      }
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
  }
})