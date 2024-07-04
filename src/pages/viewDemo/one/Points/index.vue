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
import axesHelper from "../../../../common/three/axesHelper";
const drawer = ref(false),
  requestRef = ref<number | null>(null),
  tipArr = ref([
    {
      description: `THREE.PointsMaterial 是 Three.js 中用于渲染粒子系统的材质。它包含了一些特定的属性，用于控制粒子的外观和行为。下面是这些属性的通俗解释，并举例说明它们的作用：<br>

color: new THREE.Color(params.color)<br>

颜色属性，决定粒子的颜色。<br>
例如，如果 params.color 是 #ff0000，粒子会显示为红色。<br>
size: params.size<br>

粒子的大小。<br>
例如，如果 params.size 是 5，每个粒子的直径会是 5 个单位。<br>
sizeAttenuation: true<br>

粒子的大小是否随距离衰减。设为 true 时，粒子离摄像机越远，看起来就越小。<br>
例如，当你靠近一个发光的萤火虫，它看起来会更大，远离时则会变小。<br>
depthWrite: false<br>

是否将粒子的深度信息写入深度缓冲区。设为 false 时，可以避免一些深度冲突的问题。<br>
例如，在一个雾化效果的场景中，粒子可以正确地覆盖在其他物体上，而不会因为深度写入导致错误的遮挡。<br>
blending: THREE.AdditiveBlending<br>

粒子的混合方式。THREE.AdditiveBlending 会使粒子颜色叠加，产生发光效果。<br>
例如，多个发光的粒子叠加在一起时，颜色会变得更亮，就像烟花一样。<br>
map: particlesTexture<br>

粒子的纹理贴图，决定粒子的形状和外观。<br>
例如，如果 particlesTexture 是一个星形的纹理，每个粒子都会显示为小星星。<br>
alphaMap: particlesTexture <br>

粒子的透明度贴图，用于控制粒子的透明部分。<br>
例如，如果 particlesTexture 的中间部分是透明的，那么粒子的中心会变得透明。<br>
transparent: true <br>

是否启用粒子的透明效果。<br>
例如，如果这个属性设为 true，粒子可以半透明地显示，适合制作烟雾或火焰效果。<br>
vertexColors: true <br>

是否使用顶点颜色。这意味着每个粒子可以有不同的颜色，而不仅仅是单一的颜色。<br>
例如，在一个粒子系统中，不同的粒子可以根据它们的位置显示不同的颜色，从而创建彩虹效果。`,
      code: `   const textureLoader = new THREE.TextureLoader()
    const particlesTexture = textureLoader.load('/texture/particles/1.png')
    scene.add(axesHelper)
    const params = {
      count: 10000,
      size: 0.1,
      radius: 5,
      branch: 3,
      color: '#ff6030',
      rotateScale: 0.3,
      endColor: '#1b3984'
    }
    let geometry = null
    let material = null
    let points = null
    const centerColor = new THREE.Color(params.color)
    const endColor = new THREE.Color(params.endColor)
    const generateGalaxy = () => {
      // 生成顶点
      geometry = new THREE.BufferGeometry()
      //   随机生成位置和
      const positions = new Float32Array(params.count * 3)
      // 设置顶点颜色
      const colors = new Float32Array(params.count * 3)

      //   循环生成点
      for (let i = 0; i < params.count; i++) {
        //   当前的点应该在哪一条分支的角度上
        const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch)

        // 当前点距离圆心的距离
        const distance = Math.random() * params.radius * Math.pow(Math.random(), 3)
        const current = i * 3

        const randomX = (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5
        const randomY = (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5
        const randomZ = (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5

        // const randomX = (Math.pow(Math.random() * 2 - 1, 3) * distance) / 5;
        // const randomY = (Math.pow(Math.random() * 2 - 1, 3) * distance) / 5;
        // const randomZ = (Math.pow(Math.random() * 2 - 1, 3) * distance) / 5;

        positions[current] = Math.cos(branchAngel + distance * params.rotateScale) * distance + randomX
        positions[current + 1] = 0 + randomY
        positions[current + 2] = Math.sin(branchAngel + distance * params.rotateScale) * distance + randomZ

        // 混合颜色，形成渐变色
        const mixColor = centerColor.clone()
        mixColor.lerp(endColor, distance / params.radius)

        colors[current] = mixColor.r
        colors[current + 1] = mixColor.g
        colors[current + 2] = mixColor.b
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      //   设置点材质
      material = new THREE.PointsMaterial({
        // color: new THREE.Color(params.color),
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: particlesTexture,
        alphaMap: particlesTexture,
        transparent: true,
        vertexColors: true
      })

      points = new THREE.Points(geometry, material)

      scene.add(points)
    }
    generateGalaxy()`,
      height: "330px",
    },
  ]);
onMounted(() => {
  nextTick(() => {
    fncamera();
    rendererfn();
    animate();
    addControls();
    windowinit();
    const textureLoader = new THREE.TextureLoader(),
      particlesTexture = textureLoader.load("/texture/particles/1.png");
    scene.add(axesHelper);
    const params = {
      count: 10000,
      size: 0.1,
      radius: 5,
      branch: 3,
      color: "#ff6030",
      rotateScale: 0.3,
      endColor: "#1b3984",
    };
    let geometry = null,
      material = null,
      points = null;
    const centerColor = new THREE.Color(params.color),
      endColor = new THREE.Color(params.endColor),
      generateGalaxy = () => {
        // 生成顶点
        geometry = new THREE.BufferGeometry();
        //   随机生成位置和
        const positions = new Float32Array(params.count * 3),
          // 设置顶点颜色
          colors = new Float32Array(params.count * 3);

        //   循环生成点
        for (let i = 0; i < params.count; i++) {
          //   当前的点应该在哪一条分支的角度上
          const branchAngel =
              (i % params.branch) * ((2 * Math.PI) / params.branch),
            // 当前点距离圆心的距离
            distance =
              Math.random() * params.radius * Math.pow(Math.random(), 3),
            current = i * 3,
            randomX =
              (Math.pow(Math.random() * 2 - 1, 3) *
                (params.radius - distance)) /
              5,
            randomY =
              (Math.pow(Math.random() * 2 - 1, 3) *
                (params.radius - distance)) /
              5,
            randomZ =
              (Math.pow(Math.random() * 2 - 1, 3) *
                (params.radius - distance)) /
              5;

          // const randomX = (Math.pow(Math.random() * 2 - 1, 3) * distance) / 5;
          // const randomY = (Math.pow(Math.random() * 2 - 1, 3) * distance) / 5;
          // const randomZ = (Math.pow(Math.random() * 2 - 1, 3) * distance) / 5;

          positions[current] =
            Math.cos(branchAngel + distance * params.rotateScale) * distance +
            randomX;
          positions[current + 1] = 0 + randomY;
          positions[current + 2] =
            Math.sin(branchAngel + distance * params.rotateScale) * distance +
            randomZ;

          // 混合颜色，形成渐变色
          const mixColor = centerColor.clone();
          mixColor.lerp(endColor, distance / params.radius);

          colors[current] = mixColor.r;
          colors[current + 1] = mixColor.g;
          colors[current + 2] = mixColor.b;
        }

        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        //   设置点材质
        material = new THREE.PointsMaterial({
          // color: new THREE.Color(params.color),
          size: params.size,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          map: particlesTexture,
          alphaMap: particlesTexture,
          transparent: true,
          vertexColors: true,
        });

        points = new THREE.Points(geometry, material);
        scene.add(points);
      };
    generateGalaxy();

    function nowanimate() {
      requestRef.value = requestAnimationFrame(nowanimate); // 更新 ref 的当前值
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
