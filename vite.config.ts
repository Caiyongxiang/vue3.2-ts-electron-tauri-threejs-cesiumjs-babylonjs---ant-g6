import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
// import path from "path";
import { codeInspectorPlugin } from "code-inspector-plugin";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    vue(),
    VueRouter({
      /* options */
    }),
    codeInspectorPlugin({
      bundler: "vite",
    }),
    monacoEditorPlugin({}),
  ],
  css: {
    preprocessorOptions: {
      less: {
        // 这里可以配置Less的全局变量等
        // additionalData: `@import "${path.resolve(__dirname, "src/style/mixin.less")}";`,
        javascriptEnabled: true, // 允许在Less文件中使用JavaScript
        // 如果需要更改Less变量的默认值，可以使用 modifyVars
        // modifyVars: {
        //   'primary-color': '#ff4757',
        //   // ... 其他变量
        // },
      },
    },
  },
  server: {
    host: "0.0.0.0",
  },
});
