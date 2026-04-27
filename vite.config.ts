import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import aiHandler from "./api/ai.js";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "stocksense-ai-api",
      configureServer(server) {
        server.middlewares.use("/api/ai", (req, res) => {
          void aiHandler(req, res);
        });
      },
    },
  ],
});
