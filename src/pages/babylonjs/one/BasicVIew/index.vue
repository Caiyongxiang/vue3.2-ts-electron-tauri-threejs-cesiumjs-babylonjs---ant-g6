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
      <div v-for="(item, index) in tipArr" :key="index">
        <p>{{ item.description }}</p>
        <div
          :id="`editor${index}`"
          style="width: 100%"
          :style="{ height: item.height }"
        ></div>
      </div>
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";
import * as monaco from "monaco-editor";
import BasicScene from "../../../../common/babylonjs/BasicScene";
import {
  MeshBuilder,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
} from "babylonjs";
const drawer = ref(false),
  babylonword = ref(),
  editorInstances = ref<monaco.editor.IStandaloneCodeEditor[]>([]),
  tipArr = ref([
    {
      description:
        "babylonjs渲染步骤:初始化引擎绑定Demo元素,创建场景，引擎循环渲染场景",
      code: `this.canvas = document.getElementsByClassName(
        "cyxScene"
      )[0] as HTMLCanvasElement;
      this.engine = new Engine(this.canvas); // 初始化引擎
      this.scene = this.createScene(); // 创建场景
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });`,
      height: "200px",
    },
    {
      description:
        "创建场景步骤：场景绑定引擎，创建相机绑定Demo元素，创建灯光和盒子绑定场景",
      code: `createScene(): Scene {
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
      return scene;`,
      height: "200px",
    },
  ]);
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
    MeshBuilder.CreateBox("box", {}, scene); // 将盒子添加到场景中
  });
});
onBeforeUnmount(() => {
  babylonword.value.dispose();
  // editorInstances.value.forEach(
  //   (editor: monaco.editor.IStandaloneCodeEditor) => {
  //     editor.dispose();
  //   }
  // );
});
const opendraw = (): void => {
  drawer.value = true;
  nextTick(() => {
    tipArr.value.forEach((item, index) => {
      const editorContainer = document.querySelector(
        `#editor${index}`
      ) as HTMLElement;
      if (editorContainer) {
        const editor = monaco.editor.create(editorContainer, {
          value: item.code,
          language: "javascript",
          fontSize: 14,
        });
        editorInstances.value.push(editor);
      }
    });
  });
};
</script>
