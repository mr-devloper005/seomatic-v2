// vite.config.ts
import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()] as PluginOption[],
  base: "/",
  preview: { port: 4173 }
});
