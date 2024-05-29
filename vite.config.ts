import { defineConfig } from 'vite';
import { resolve } from "path";
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueSetupExtend from 'vite-plugin-vue-setup-extend'

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@apis": resolve(__dirname, "src/apis")
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    mainFields: ['main', 'module', 'browser'],
  },
  css: {
    preprocessorOptions: {
      // 全局样式引入
      scss: {
        additionalData: '@import "./src/styles/variables.scss";',
        javascriptEnabled: true
      }
    }
  },
  plugins: [
    vue(), 
    vueJsx(),
    vueSetupExtend(),
    // AutoImport({
    //   dts: 'types/auto-imports.d.ts',
    //   resolvers: [ElementPlusResolver()],
    // }),
    // Components({
    //   dirs: "src/components/global",
    //   dts: 'types/components.d.ts',
    //   resolvers: [ElementPlusResolver()],
    // }),
  ],
})
