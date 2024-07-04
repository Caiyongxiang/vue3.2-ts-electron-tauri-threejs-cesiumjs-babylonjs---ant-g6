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
        <p>{{ item.description }}</p>
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
import { windowinit } from "../../../../common/three/init";
import axesHelper from "../../../../common/three/axesHelper";
import { addControls } from "../../../../common/three/controls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
const drawer = ref(false),
  requestRef = ref<number | null>(null),
  tipArr = ref([
    {
      description: "界面自适应",
      code: `window.addEventListener('resize', () => {
    // 重置渲染器宽高比
    renderer.setSize(
      (document.getElementsByClassName('cyxScene')[0] as HTMLElement).offsetWidth,
      (document.getElementsByClassName('cyxScene')[0] as HTMLElement).offsetHeight
    )
    // 重置相机宽高比
    camera.aspect =
      (document.getElementsByClassName('cyxScene')[0] as HTMLElement).offsetWidth /
      (document.getElementsByClassName('cyxScene')[0] as HTMLElement).offsetHeight
    // 更新相机投影矩阵
    camera.updateProjectionMatrix()
  })`,
      height: "180px",
    },
    {
      description: "坐标轴和轨道控制器",
      code: `//添加坐标轴
    const axesHelper = new THREE.AxesHelper(5)
 // 添加轨道控制器
  const controls = new OrbitControls(camera, document.getElementsByClassName('cyxScene')[0] as HTMLElement)
  // 设置带阻尼的惯性
  controls.enableDamping = true
  // 设置阻尼系数
  controls.dampingFactor = 0.05
  // 设置旋转速度
  controls.autoRotate = true
  //附加模型
   parentCube.add(cube)`,
      height: "180px",
    },
    {
      description: "附加子模型,模型缩放和旋转,dom的全屏和退出全屏",
      code: `parentCube.add(cube)
        // 设置立方体的放大
    cube.scale.set(2, 2, 2)
      // 绕着x轴旋转
    cube.rotation.x = Math.PI / 4
     // 全屏
        document.body.requestFullscreen()
          document.exitFullscreen()`,
      height: "100px",
    },
    {
      description:
        "gui的配置 gui一般第一个参数是对象，第二个参数是具体的键名，会根据你的参数类型显示对应的操作设计",
      code: `// 创建GUI
    const gui = new GUI()
    // 添加按钮 第一个参数对象，第二人参数键名
    gui.add(eventObj, 'Fullscreen').name('全屏')
    gui.add(eventObj, 'ExitFullscreen').name('退出全屏')
    //创建新的下拉框
     let folder = gui.addFolder('立方体位置')
    //加节点
    folder
      .add(cube.position, 'x')
      .min(-10)
      .max(10)
      .step(1)
      .name('立方体x轴位置')
      .onChange(val => {
        console.log('立方体x轴位置', val)
      })
    //布尔值
     gui.add(parentMaterial, 'wireframe').name('父元素线框模式')
     //颜色
        gui
      .addColor(colorParams, 'cubeColor')
      .name('立方体颜色')
      .onChange(val => {
        cube.material.color.set(val)
      })`,
      height: "230px",
    },

    {
      description: "索引绘制图形",
      code: `// 使用索引绘制
    const vertices = new Float32Array([-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0])
    // 创建顶点属性
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    // 创建索引
    const indices = new Uint16Array([0, 1, 2, 2, 3, 0])
    // 创建索引属性
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))

    console.log(geometry)
    // 创建材质
    const material1 = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      // side: THREE.DoubleSide,
      wireframe: true
    })
    const plane = new THREE.Mesh(geometry, material1)
    scene.add(plane)
    //setIndex和setAttribute有关，为了顶点复用
   // 当你在处理位置（position）、颜色（color）、法线（normal）等属性时，这些属性通常包含多个值（例如，位置通常由 x, y, z 三个坐标组成，所以其对应的参数是 3`,
      height: "260px",
    },
    {
      description: "索引绘制多材质",
      code: `const geometry1 = new THREE.BufferGeometry()
// 使用索引绘制
const vertices1 = new Float32Array([-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0])
// 创建顶点属性
geometry1.setAttribute('position', new THREE.BufferAttribute(vertices1, 3))
// 创建索引
const indices1 = new Uint16Array([0, 1, 2, 2, 3, 0])
// 创建索引属性
geometry1.setIndex(new THREE.BufferAttribute(indices1, 1))

// 设置2个顶点组，形成2个材质
geometry1.addGroup(0, 3, 0)
geometry1.addGroup(3, 3, 1)
// 创建材质
const material2 = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  // side: THREE.DoubleSide,
  wireframe: true
})
const material3 = new THREE.MeshBasicMaterial({
  color: 0xff0000
})
const plane1 = new THREE.Mesh(geometry1, [material2, material3])`,
      height: "260px",
    },
  ]),
  // const
  // 创建GUI
  gui = new GUI();
onMounted(() => {
  nextTick(() => {
    fncamera();
    rendererfn();
    animate();
    windowinit();

    scene.add(axesHelper);
    // 创建几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1),
      // 创建材质
      material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
      parentMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    // 创建网格
    let parentCube = new THREE.Mesh(geometry, parentMaterial);
    const cube = new THREE.Mesh(geometry, material);
    parentCube.add(cube);
    parentCube.position.set(-3, 0, 0);
    // 设置立方体的放大
    // cube.scale.set(2, 2, 2)
    // cube.position.x = 2;
    cube.position.set(3, 0, 0);
    // 设置立方体的放大
    // cube.scale.set(2, 2, 2);
    // 绕着x轴旋转
    cube.rotation.x = Math.PI / 4;
    // 将网格添加到场景中
    scene.add(parentCube);
    // 使用索引绘制
    const vertices = new Float32Array([
      -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0,
    ]);
    // 创建顶点属性
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    // 创建索引
    const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
    // 创建索引属性
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    console.log(geometry);
    // 创建材质
    const material1 = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        // side: THREE.DoubleSide,
        wireframe: true,
      }),
      plane = new THREE.Mesh(geometry, material1);
    scene.add(plane);

    const geometry1 = new THREE.BufferGeometry(),
      // 使用索引绘制
      vertices1 = new Float32Array([
        -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0,
      ]);
    // 创建顶点属性
    geometry1.setAttribute("position", new THREE.BufferAttribute(vertices1, 3));
    // 创建索引
    const indices1 = new Uint16Array([0, 1, 2, 2, 3, 0]);
    // 创建索引属性
    geometry1.setIndex(new THREE.BufferAttribute(indices1, 1));

    // 设置2个顶点组，形成2个材质
    geometry1.addGroup(0, 3, 0);
    geometry1.addGroup(3, 3, 1);
    // 创建材质
    const material2 = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        // side: THREE.DoubleSide,
        wireframe: true,
      }),
      material3 = new THREE.MeshBasicMaterial({
        color: 0xff0000,
      }),
      plane1 = new THREE.Mesh(geometry1, [material2, material3]);
    plane1.position.set(0, 3, 3);
    scene.add(plane1);
    //轨道控制器
    addControls();
    let eventObj = {
      Fullscreen: function () {
        // 全屏
        document.body.requestFullscreen();
        console.log("全屏");
      },
      ExitFullscreen: function () {
        document.exitFullscreen();
        console.log("退出全屏");
      },
    };
    // 添加按钮 第一个参数对象，第二人参数键名
    gui.add(eventObj, "Fullscreen").name("全屏");
    gui.add(eventObj, "ExitFullscreen").name("退出全屏");
    // 控制立方体的位置
    // gui.add(cube.position, "x", -5, 5).name("立方体x轴位置");
    let folder = gui.addFolder("立方体位置");
    //加节点
    folder
      .add(cube.position, "x")
      .min(-10)
      .max(10)
      .step(1)
      .name("立方体x轴位置")
      .onChange((val) => {
        console.log("立方体x轴位置", val);
      });
    folder
      .add(cube.position, "y")
      .min(-10)
      .max(10)
      .step(1)
      .name("立方体y轴位置")
      .onFinishChange((val) => {
        console.log("立方体y轴位置", val);
      });
    folder
      .add(cube.position, "z")
      .min(-10)
      .max(10)
      .step(1)
      .name("立方体z轴位置");

    gui.add(parentMaterial, "wireframe").name("父元素线框模式");

    let colorParams = {
      cubeColor: "#00ff00",
    };

    gui
      .addColor(colorParams, "cubeColor")
      .name("立方体颜色")
      .onChange((val) => {
        cube.material.color.set(val);
      });
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
      //   if (obj.material) {
      //     obj.material.dispose();
      //   }
    }
  });
  scene.clear();
  gui.destroy();
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
