import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/redux": path.resolve(__dirname, "./src/redux"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  define: {
    // Define global constants for better tree-shaking
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  build: {
    // Optimize build output
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['@radix-ui/react-slot', 'lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router', '@reduxjs/toolkit'],
  },
})
