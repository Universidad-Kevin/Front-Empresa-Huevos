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
      '.onrender.com'  // Permite todos los subdominios de onrender.com
    ]
  },
});
