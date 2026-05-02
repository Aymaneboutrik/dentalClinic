import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@configs": path.resolve(__dirname, "./src/configs"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@stores": path.resolve(__dirname, "./src/stores"),
      "@helpers": path.resolve(__dirname, "./src/helpers"),
      "@apis": path.resolve(__dirname, "./src/apis"),
    },
  },
  server: {
    host: true,
    watch: {
      usePolling: process.env.VITE_USE_POLLING === "true" || process.env.CHOKIDAR_USEPOLLING === "true",
      interval: 1000,
      ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
    },
    proxy: {
      "/api": {
        // In Docker network, the nginx service is reachable as "nginx".
        // In local dev on Windows/macOS/Linux, use the published nginx port on localhost.
        // Can be overridden with VITE_API_PROXY_TARGET (e.g. "http://localhost:5003").
        target: fs.existsSync("/.dockerenv")
          ? "http://nginx"
          : (process.env.VITE_API_PROXY_TARGET || "http://localhost:80"),
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
