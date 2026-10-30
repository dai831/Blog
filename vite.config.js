import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  devServer: {
    host: true,
    port: 8080,
    open: true
  }
})
