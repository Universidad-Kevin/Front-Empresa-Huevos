import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      strict: false,
    },
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'front-empresa-huevos.onrender.com',
      '.onrender.com'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Runtime de React — cambia muy poco, se cachea por mucho tiempo
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // recharts solo lo usan las páginas admin de estadísticas/dashboard
          'vendor-recharts': ['recharts'],
          // Bootstrap UI — separado del app para caché independiente
          'vendor-bootstrap': ['react-bootstrap', 'bootstrap'],
          // HTTP + SEO — librerías pequeñas pero con versión propia
          'vendor-misc': ['axios', 'react-helmet-async'],
        },
      },
    },
  },
});
