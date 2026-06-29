import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import viteImagemin from "vite-plugin-imagemin";
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    viteImagemin({
      webp: { quality: 80 },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
