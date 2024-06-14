// src/router/index.ts

import { defineAsyncComponent } from "vue";
import { createRouter, createWebHistory } from "vue-router";

// 更新后的组件引入
const HomePage = defineAsyncComponent(() => import("../views/HomePage.vue")),
  AboutUs = defineAsyncComponent(() => import("../views/AboutPage.vue")),
  // 更新后的路由配置
  routes = [
    { path: "/", redirect: "/about" },
    {
      path: "/about",
      component: AboutUs,
      children: [{ path: "details", component: HomePage }],
    },
  ],
  router = createRouter({
    history: createWebHistory(),
    routes,
  });

export default router;
