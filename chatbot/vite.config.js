import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const api = process.env.LOOPFORGE_API || "http://127.0.0.1:8080";
export default defineConfig({
  base: "/chatbot/",
  plugins: [react()],
  build: { outDir: "../web/native-chat", emptyOutDir: true },
  server: {
    port: 18769,
    proxy: {
      "/api": api,
      "/mcp": api,
      // Language layer shared with the platform pages (see index.html).
      "^/(boot|i18n|i18n-en|i18n-chat-en)\\.js$": api,
    },
  },
});
