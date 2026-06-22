import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  return {
    base: command === 'serve' ? '/' : './',
    plugins: [react()],
    server: {
      port: 5174,
      host: true,
    },
  }
})