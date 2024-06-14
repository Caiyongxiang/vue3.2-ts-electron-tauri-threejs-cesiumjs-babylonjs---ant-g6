import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router/auto";
import { routes } from "vue-router/auto-routes";
import "./style.css";
import App from "./App.vue";
const router = createRouter({ history: createWebHistory(), routes }),
  app = createApp(App);
// 使用路由器
app.use(router);

app.mount("#app");