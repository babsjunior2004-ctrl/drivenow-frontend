import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuration Vite pour le développement
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Toutes les requêtes /api/* sont redirigées vers le backend NestJS
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
