<template>
  <div style="width: 100%; height: 100%">
    <canvas class="cyxScene" style="width: 100%; height: 100%"> </canvas>
    <el-button
      type="primary"
      style="position: fixed; top: 10px; right: 10px"
      @click="opendraw"
    >
      笔记
    </el-button>

    <el-drawer v-model="drawer" title="笔记内容" :with-header="false">
      <p>加载和操作模型</p>
      <div style="height: 300px; width: 100%" ref="threeworld"></div>
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";
import * as monaco from "monaco-editor";
import BasicScene from "../../../../common/babylonjs/BasicScene";
import {
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  SceneLoader,
} from "babylonjs";
const drawer = ref(false),
  threeworld = ref(),
  modelworld = ref(),
  babylonword = ref();

onMounted(() => {
  nextTick(() => {
    babylonword.value = new BasicScene();
    const scene = babylonword.value.getScene(),
      canvas = babylonword.value.getcanvas(),
      camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2.5,
        10,
        new Vector3(0, 0, 0),
        scene
      );
    camera.attachControl(canvas, true); // 注意：修改了拼写错误
    new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    SceneLoader.ImportMeshAsync(
      ``,
      "https://assets.babylonjs.com/meshes/",
      "both_houses_scene.babylon"
    ).then(() => {
      const house = scene.getMeshByName("detached_house")!;
      house.position.y = 1;
    });
  });
});
onBeforeUnmount(() => {
  babylonword.value.dispose();
  if (threeworld.value && threeworld.value.__editor) {
    threeworld.value.__editor.dispose();
  }
  if (modelworld.value && modelworld.value.__editor) {
    modelworld.value.__editor.dispose();
  }
});
const opendraw = (): void => {
  drawer.value = true;
  nextTick(() => {
    monaco.editor.create(threeworld.value, {
      value: ` SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "both_houses_scene.babylon"
    ).then(() => {
      const house = scene.getMeshByName("detached_house")!;
      house.position.y = 1;
    });`,
      language: "javascript",
      fontSize: 14,
    });
  });
};
</script>
