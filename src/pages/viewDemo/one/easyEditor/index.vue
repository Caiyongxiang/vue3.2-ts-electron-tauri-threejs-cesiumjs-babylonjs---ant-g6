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
import { fncamera, camera } from "../../../../common/three/camera";
import { renderer, rendererfn } from "../../../../common/three/renderer";
import animate from "../../../../common/three/animate";
import { addControls } from "../../../../common/three/controls";
import { windowinit } from "../../../../common/three/init";
// 导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// 导入hdr加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 导入gltf加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入draco解码器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// 导入变换控制器
import { TransformControls } from "three/addons/controls/TransformControls.js";
// 创建场景
const drawer = ref(false),
  requestRef = ref<number | null>(null),
  tipArr = ref([
    {
      description: "添加网格辅助器",
      code: ` // 添加网格辅助器
    const gridHelper = new THREE.GridHelper(50, 50);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);`,
      height: "50px",
    },
    {
      description: "创建变换控制器",
      code: ` let tControls = new TransformControls(camera, renderer.domElement)
      // 添加变换控制器
      scene.add(tControls)
      //控制器包裹物体
      tControls.attach(mesh);
      `,
      height: "180px",
    },
    {
      description: "切换模式(移动，旋转，放大缩小,取消选中)",
      code: `
      eventObj = {
        addScene: function () {
          //@ts-ignore
          scene.add(basicScene);
        },
        setTranslate: function () {
          tControls.setMode("translate");
        },
        setRotate: function () {
          tControls.setMode("rotate");
        },
        setScale: function () {
          tControls.setMode("scale");
        },
        toggleSpace: function () {
          tControls.setSpace(tControls.space === "local" ? "world" : "local");
        },
        cancelMesh: function () {
          tControls.detach();
        },
        translateSnapNum: null,
        rotateSnapNum: 0,
        scaleSnapNum: 0,
        isClampGroup: false,
        isLight: true,
      };
      `,
      height: "180px",
    },
    {
      description: `局部坐标系：物体移动和旋转基于它自己的方向和位置。<br>
世界坐标系：物体移动和旋转基于整个场景的方向和位置。<br>
这个切换功能对于建模和动画制作非常有用，因为有时候你希望物体沿着它自身的方向移动，而有时候你希望物体沿着场景的方向移动。`,
      code: `  tControls.setSpace(tControls.space === "local" ? "world" : "local");
   `,
      height: "30px",
    },
    {
      description: `监听拖动事件，当拖动物体时候，禁用轨道控制器 限制移动旋转和缩放`,
      code: `
    tControls.addEventListener("dragging-changed", function (event) {
      controls.enabled = !event.value;
    });
    tControls.addEventListener("change", () => {
      if (eventObj.isClampGroup) {
        tControls!.object!.position.y = 0;
      }
    });
    //限制移动旋转和缩放
     let snapFolder = gui.addFolder("固定设置");
    snapFolder
      //@ts-ignore
      .add(eventObj, "translateSnapNum", {
        不固定: null,
        1: 1,
        0.1: 0.1,
        10: 10,
      })
      .name("固定位移设置")
      .onChange(() => {
        tControls.setTranslationSnap(eventObj.translateSnapNum);
      });
    snapFolder
      .add(eventObj, "rotateSnapNum", 0, 1)
      .step(0.01)
      .name("旋转")
      .onChange(() => {
        tControls.setRotationSnap(eventObj.rotateSnapNum * Math.PI * 2);
      });
    snapFolder
      .add(eventObj, "scaleSnapNum", 0, 2)
      .step(0.1)
      .name("缩放")
      .onChange(() => {
        tControls.setScaleSnap(eventObj.scaleSnapNum);
      });
    snapFolder.add(eventObj, "isClampGroup").name("是否吸附到地面");
  });`,
      height: "180px",
    },
  ]),
  // 创建GUI

  gui = new GUI();
onMounted(() => {
  nextTick(() => {
    let basicScene = "";
    fncamera();
    rendererfn();
    animate();
    let controls = addControls();
    windowinit();
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1;
    // 添加世界坐标辅助器
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    // 添加网格辅助器
    const gridHelper = new THREE.GridHelper(50, 50);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    function nowanimate() {
      requestRef.value = requestAnimationFrame(nowanimate); // 更新 ref 的当前值
    }
    nowanimate();
    // rgbeLoader 加载hdr贴图
    let rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      "../../../texture/Alex_Hart-Nature_Lab_Bones_2k.hdr",
      (envMap) => {
        if (window.location.pathname !== "/viewDemo/one/easyEditor") {
          return;
        }
        // 设置球形贴图
        // envMap.mapping = THREE.EquirectangularReflectionMapping;
        envMap.mapping = THREE.EquirectangularRefractionMapping;
        // 设置环境贴图
        // scene.background = envMap;
        scene.background = new THREE.Color(0xcccccc);
        // 设置环境贴图
        scene.environment = envMap;
      }
    );
    // rgbeLoader 加载hdr贴图
    // 实例化加载器gltf
    const gltfLoader = new GLTFLoader(),
      // 实例化加载器draco
      dracoLoader = new DRACOLoader();
    // 设置draco路径
    dracoLoader.setDecoderPath("../../draco/");
    // 设置gltf加载器draco解码器
    gltfLoader.setDRACOLoader(dracoLoader);
    // 加载模型
    gltfLoader.load(
      // 模型路径
      "../../../model/house/house-scene-min.glb",
      // 加载完成回调
      (gltf) => {
        if (window.location.pathname !== "/viewDemo/one/easyEditor") {
          return;
        }
        //@ts-ignore
        basicScene = gltf.scene;
      }
    );
    // 创建变换控制器
    let tControls = new TransformControls(camera, renderer.domElement),
      eventObj = {
        addScene: function () {
          //@ts-ignore
          scene.add(basicScene);
        },
        setTranslate: function () {
          tControls.setMode("translate");
        },
        setRotate: function () {
          tControls.setMode("rotate");
        },
        setScale: function () {
          tControls.setMode("scale");
        },
        toggleSpace: function () {
          tControls.setSpace(tControls.space === "local" ? "world" : "local");
        },
        cancelMesh: function () {
          tControls.detach();
        },
        translateSnapNum: null,
        rotateSnapNum: 0,
        scaleSnapNum: 0,
        isClampGroup: false,
        isLight: true,
      };
    // tControls.addEventListener("change", animate);
    // 监听拖动事件，当拖动物体时候，禁用轨道控制器
    tControls.addEventListener("dragging-changed", function (event) {
      controls.enabled = !event.value;
    });
    tControls.addEventListener("change", () => {
      if (eventObj.isClampGroup) {
        tControls!.object!.position.y = 0;
      }
    });
    scene.add(tControls);

    gui.add(eventObj, "addScene").name("添加户型基础模型");
    gui.add(eventObj, "setTranslate").name("位移模式");
    gui.add(eventObj, "setRotate").name("旋转模式");
    gui.add(eventObj, "setScale").name("缩放模式");
    gui.add(eventObj, "toggleSpace").name("切换空间模式");
    gui.add(eventObj, "cancelMesh").name("取消选择");
    gui
      .add(eventObj, "isLight")
      .name("是否开启灯光")
      .onChange((value) => {
        if (value) {
          renderer.toneMappingExposure = 1;
        } else {
          renderer.toneMappingExposure = 0.1;
        }
      });
    // 监听鼠标按键事件
    window.addEventListener("keydown", (event) => {
      // 判断是否按的是t键
      if (event.key === "t") {
        eventObj.setTranslate();
      }
      if (event.key === "r") {
        eventObj.setRotate();
      }
      if (event.key === "s") {
        eventObj.setScale();
      }
    });

    // 添加物体目录
    let meshList: any = [
        {
          name: "盆栽",
          path: "../../../model/house/plants-min.glb",
        },
        {
          name: "单人沙发",
          path: "../../../model/house/sofa_chair_min.glb",
        },
      ],
      folderAddMehs = gui.addFolder("添加物体"),
      sceneMeshes = [],
      meshesNum = {};
    function tControlSelect(mesh: any) {
      tControls.attach(mesh);
    }
    let meshesFolder = gui.addFolder("家居列表");
    meshList.forEach((item: any) => {
      item.addMesh = function () {
        gltfLoader.load(item.path, (gltf) => {
          if (window.location.pathname !== "/viewDemo/one/easyEditor") {
            return;
          }
          sceneMeshes.push({
            ...item,
            object3d: gltf.scene,
          });
          let object3d = gltf.scene;

          scene.add(object3d);
          tControlSelect(object3d);
          let meshOpt = {
            toggleMesh: function () {
              tControlSelect(object3d);
            },
          };
          //@ts-ignore
          meshesNum[item.name] = meshesNum[item.name]
            ? //@ts-ignore
              meshesNum[item.name] + 1
            : 1;
          //@ts-ignore
          meshesFolder
            .add(meshOpt, "toggleMesh")
            //@ts-ignore
            .name(item.name + meshesNum[item.name]);
        });
      };
      folderAddMehs.add(item, "addMesh").name(item.name);
    });

    let snapFolder = gui.addFolder("固定设置");
    snapFolder
      //@ts-ignore
      .add(eventObj, "translateSnapNum", {
        不固定: null,
        1: 1,
        0.1: 0.1,
        10: 10,
      })
      .name("固定位移设置")
      .onChange(() => {
        tControls.setTranslationSnap(eventObj.translateSnapNum);
      });
    snapFolder
      .add(eventObj, "rotateSnapNum", 0, 1)
      .step(0.01)
      .name("旋转")
      .onChange(() => {
        tControls.setRotationSnap(eventObj.rotateSnapNum * Math.PI * 2);
      });
    snapFolder
      .add(eventObj, "scaleSnapNum", 0, 2)
      .step(0.1)
      .name("缩放")
      .onChange(() => {
        tControls.setScaleSnap(eventObj.scaleSnapNum);
      });
    snapFolder.add(eventObj, "isClampGroup").name("是否吸附到地面");
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
  // 设置环境贴图
  scene.environment = null;
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
