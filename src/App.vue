<!-- src/App.vue -->

<template>
  <div style="width: 100%; height: 100%; overflow: hidden">
    <div style="float: left; height: 100%; width: 22%">
      <el-row class="tac" style="height: 100%">
        <el-col :span="24" style="height: 100%">
          <el-menu
            active-text-color="#ffd04b"
            background-color="#545c64"
            class="el-menu-vertical-demo"
            default-active="oneFirstView"
            text-color="#fff"
            style="height: 100%"
          >
            <el-sub-menu
              v-for="item in Items"
              :index="item.key"
              :key="item.key"
            >
              <template #title>
                <el-icon><icon-menu /></el-icon>
                <span>{{ item.label }}</span>
              </template>

              <el-sub-menu
                v-for="item1 in item.children"
                :index="item1.key"
                :key="item1.key"
              >
                <template #title>
                  <el-icon><View /></el-icon>
                  <span>{{ item1.label }}</span>
                </template>
                <el-menu-item
                  v-for="item2 in item1.children"
                  @click="open(item.key, item1.key, item2.key)"
                  :index="item2.key"
                  :key="item2.key"
                >
                  {{ item2.label }}
                </el-menu-item>
              </el-sub-menu>
            </el-sub-menu>
          </el-menu>
        </el-col>
      </el-row>
    </div>
    <div style="float: left; height: 100%; width: 78%">
      <router-view />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from "vue";
import { Menu as IconMenu } from "@element-plus/icons-vue";
import Items from "./common/menuItem";
import { useRouter } from "vue-router";

const router = useRouter(),
  open = (key: string, key1: string, key2: string) => {
    router.push(`/${key}/${key1}/${key2}`);
  };
onMounted(() => {
  router.push(`/viewDemo/one/oneFirstView`);
});
</script>
<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
}
</style>
