import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/snort-ids-app/',
  build: { outDir: 'dist' },
})
