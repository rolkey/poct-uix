import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "PoctShared",
      formats: ["es"],
      fileName: () => "poct-shared.mjs",
    },
    rollupOptions: {
      external: [
        "vue",
        "vue-router",
        "pinia",
        "element-plus",
        "vue-i18n",
        /^@element-plus\/.*/,
      ],
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
          pinia: "Pinia",
          "element-plus": "ElementPlus",
          "vue-i18n": "VueI18n",
        },
      },
    },
  },
});
