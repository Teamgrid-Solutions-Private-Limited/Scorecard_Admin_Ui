import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'/scorecard/admin/',
  server: {
    host: 'localhost', // Change to '0.0.0.0' if you want external access
    port: 3001,        // Change to your desired port (default is 5173)
  },
})