import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  preview: {
    port: 5173,
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
