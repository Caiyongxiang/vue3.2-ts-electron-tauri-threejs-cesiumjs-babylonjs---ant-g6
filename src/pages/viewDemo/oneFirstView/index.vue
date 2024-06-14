<template>
  <div>
    <el-button
      type="primary"
      style="position: fixed; top: 10px; right: 10px"
      @click="opendraw"
    >
      笔记
    </el-button>

    <el-drawer v-model="drawer" title="笔记内容" :with-header="false">
      <p>web三维主要构成元素:场景，相机，渲染器，渲染函数实时执行渲染器构建</p>
      <div style="height: 500px; width: 500px" ref="threeworld"></div>
      <p>模型主要构成元素:几何体，材质</p>
      <div style="height: 230px; width: 500px" ref="modelworld"></div>
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";
import * as monaco from "monaco-editor";
import scene from "../../../common/three/scene";
import THREE from "../../../common/three/three";

const drawer = ref(false),
  requestRef = ref<number | null>(null),
  threeworld = ref(),
  modelworld = ref();

onMounted(() => {
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
onBeforeUnmount(() => {
  if (requestRef.value !== null) {
    cancelAnimationFrame(requestRef.value); // 取消动画帧
  }
  scene.traverse(function (obj) {
    if (obj instanceof THREE.Mesh) {
      // 确认对象为 Mesh 类型
      obj.geometry.dispose(); // 释放几何体资源
      obj.material.dispose(); // 释放材质资源
    }
  });
  scene.clear();
});
const opendraw = (): void => {
  drawer.value = true;
  nextTick(() => {
    monaco.editor.create(threeworld.value, {
      value: `
    // 导入threejs
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
      language: "javascript",
      fontSize: 14,
    });
    monaco.editor.create(modelworld.value, {
      value: `// 创建几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    // 创建材质
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    // 创建网格
    const cube = new THREE.Mesh(geometry, material)

    // 将网格添加到场景中
    scene.add(cube)`,
      language: "javascript",
      fontSize: 14,
    });
  });
};
</script>
