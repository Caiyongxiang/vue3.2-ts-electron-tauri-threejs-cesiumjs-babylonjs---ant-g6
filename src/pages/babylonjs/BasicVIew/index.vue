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
      <p>babylonjs渲染步骤:初始化引擎绑定Demo元素,创建场景，引擎循环渲染场景</p>
      <div style="height: 300px; width: 400px" ref="threeworld"></div>
      <p>
        创建场景步骤：场景绑定引擎，创建相机绑定Demo元素，创建灯光和盒子绑定场景
      </p>
      <div style="height: 280px; width: 400px" ref="modelworld"></div>
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";
import * as monaco from "monaco-editor";
import BasicScene from "../../../common/babylonjs/BasicScene";

const drawer = ref(false),
  threeworld = ref(),
  modelworld = ref(),
  babylonword = ref();

onMounted(() => {
  nextTick(() => {
    babylonword.value = new BasicScene();
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
      value: `this.canvas = document.getElementsByClassName(
      "cyxScene"
    )[0] as HTMLCanvasElement;
    this.engine = new Engine(this.canvas); // 初始化引擎
    this.scene = this.createScene(); // 创建场景
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });`,
      language: "javascript",
      fontSize: 14,
    });
    monaco.editor.create(modelworld.value, {
      value: ` createScene(): Scene {
    const scene = new Scene(this.engine),
      camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2.5,
        3,
        new Vector3(0, 0, 0),
        scene
      );
    camera.attachControl(this.canvas, true); // 注意：修改了拼写错误
    new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    MeshBuilder.CreateBox("box", {}, scene); // 将盒子添加到场景中

    return scene;
  }`,
      language: "javascript",
      fontSize: 14,
    });
  });
};
</script>
