import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  // "/" locally; the Pages workflow sets VITE_BASE=/<repo-name>/ so the app
  // works from a GitHub Pages subpath. Router basename follows in main.tsx.
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  server: { port: 8080 },
});
