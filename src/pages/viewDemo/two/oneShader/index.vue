<template>
  <div style="width: 100%; height: 100%">
    <el-button
      type="primary"
      style="position: fixed; bottom: 10px; right: 10px"
      @click="opendraw"
    >
      笔记
    </el-button>

    <el-drawer
      direction="ltr"
      v-model="drawer"
      title="笔记内容"
      :with-header="false"
    >
      <div v-for="(item, index) in tipArr" :key="index">
        <p v-html="item.description"></p>
        <div
          :id="`editor${index}`"
          style="width: 100%"
          :style="{ height: item.height }"
        ></div>
      </div>
    </el-drawer>
    <div class="cyxScene" style="width: 100%; height: 100%"></div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";
import * as monaco from "monaco-editor";
import scene from "../../../../common/three/scene";
import THREE from "../../../../common/three/three";
import { fncamera } from "../../../../common/three/camera";
import { renderer, rendererfn } from "../../../../common/three/renderer";
import animate from "../../../../common/three/animate";
import { addControls } from "../../../../common/three/controls";
import { windowinit } from "../../../../common/three/init";
const drawer = ref(false),
  requestRef = ref<number | null>(null),
  tipArr = ref([
    {
      description: `web三维主要构成元素:场景，相机，渲染器，渲染函数实时执行渲染器构建`,
      code: ` // 导入threejs
  import * as THREE from "three";
  
  // 创建场景
  const scene = new THREE.Scene();
  
  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    45, // 视角
    window.innerWidth / window.innerHeight, // 宽高比
    0.1, // 近平面
    1000 // 远平面
  );
  
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);// 设置相机位置
  camera.position.z = 5;
  camera.lookAt(0, 0, 0);
  
  // 渲染函数
  function animate() {
    requestAnimationFrame(animate);
    // 旋转
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    // 渲染
    renderer.render(scene, camera);
  }
  animate();`,
      height: "230px",
    },
    {
      description: `模型主要构成元素:几何体，材质`,
      code: `// 创建几何体
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      // 创建材质
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      // 创建网格
      const cube = new THREE.Mesh(geometry, material)
  
      // 将网格添加到场景中
      scene.add(cube)`,
      height: "230px",
    },
  ]);
// const

onMounted(() => {
  nextTick(() => {
    fncamera();
    rendererfn();
    animate();
    addControls();
    windowinit();
    // 创建几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1),
      // 创建材质
      material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
      // 创建网格
      cube = new THREE.Mesh(geometry, material);

    // 将网格添加到场景中
    scene.add(cube);
    function nowanimate() {
      requestRef.value = requestAnimationFrame(nowanimate); // 更新 ref 的当前值
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
    nowanimate();
  });
});
onBeforeUnmount(() => {
  if (requestRef.value !== null) {
    cancelAnimationFrame(requestRef.value);
  }

  // 清理Three.js场景和渲染器
  scene.traverse(function (obj) {
    if (obj instanceof THREE.Mesh) {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      // if(obj.material){
      //   obj.material.dispose();
      // }
    }
  });
  scene.clear();
  scene.background = null;
  scene.environment = null;
  if (renderer) {
    // 确保你有一个对renderer的引用
    renderer.dispose();
  }
});
const opendraw = (): void => {
  drawer.value = true;
  nextTick(() => {
    tipArr.value.forEach((item, index) => {
      const editorContainer = document.querySelector(
        `#editor${index}`
      ) as HTMLElement;
      if (editorContainer) {
        monaco.editor.create(editorContainer, {
          value: item.code,
          language: "javascript",
          fontSize: 14,
        });
      }
    });
  });
};
</script>
