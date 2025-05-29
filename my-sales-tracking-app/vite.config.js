import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: 'https://terrileedooling.github.io/salon-sales-tracking/', // 👈 use your GitHub repo name
  plugins: [react()],
});