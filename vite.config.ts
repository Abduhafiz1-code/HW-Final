import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import viteImagemin from "vite-plugin-imagemin";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    viteImagemin({
      webp: { quality: 80 },
    }),
    VitePWA({
      registerType: "autoUpdate",
      // "npm run dev" rejimida ham virtual:pwa-register/vue moduli ishlashi
      // uchun kerak — aks holda faqat "npm run build" chiqarishida ishlaydi
      // va dev serverda "Failed to resolve import" xatosi chiqadi.
      devOptions: {
        enabled: true,
        type: "module",
      },
      includeAssets: ["favicon.svg", "favicon.ico"],
      manifest: {
        name: "Socrati — o'quv va uy vazifasi yordamchisi",
        short_name: "Socrati",
        description:
          "O'quvchilar uchun uy vazifasi yordamchisi: test, mashq, AI yordamchi va reyting tizimi",
        theme_color: "#7e14ff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        lang: "uz",
        categories: ["education", "productivity"],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // App-shell (HTML/JS/CSS/rasm) offlineda ishlashi uchun keshlanadi.
        // Supabase API so'rovlari hech qachon keshlanmaydi — har doim
        // internetdan haqiqiy ma'lumot olinadi (offlineda ular shunchaki
        // xato qaytaradi, bu global offline-banner orqali foydalanuvchiga
        // ko'rsatiladi).
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.hostname.endsWith(".supabase.co"),
            handler: "NetworkOnly",
          },
        ],
      },
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
