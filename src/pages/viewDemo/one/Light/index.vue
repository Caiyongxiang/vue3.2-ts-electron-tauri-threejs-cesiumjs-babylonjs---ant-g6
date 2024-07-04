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
// 导入动画库
//@ts-ignore
import gsap from "gsap";
// 导入hdr加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { CSM } from "three/addons/csm/CSM.js";
const drawer = ref(false),
  requestRef = ref<number | null>(null),
  tipArr = ref([
    {
      description: "gsap",
      code: `  // 设置动画
    let animate1 = gsap.to(cube.position, {
      x: 3,
      duration: 5,
      ease: 'power1.inOut',
      //   设置重复的次数，无限次循环-1
      repeat: -1,
      //   往返运动
      yoyo: true,
      //   delay，延迟2秒运动
      delay: 2,
      onComplete: () => {
        console.log('动画完成')
      },
      onStart: () => {
        console.log('动画开始')
      }
    })

    let timeout: any
    const debounceTime = 300 // 防抖时间间隔，可以根据需要调整

    window.addEventListener('dblclick', () => {
      clearTimeout(timeout) // 清除之前的定时器
      timeout = setTimeout(() => {
        // 判断动画状态，并进行相应的暂停或恢复
        if (animate1.isActive()) {
          animate1.pause() // 暂停动画
        } else {
          animate1.resume() // 恢复动画
        }
      }, debounceTime) // 延迟执行的时间（毫秒）
    })

    gsap.to(cube.rotation, { x: 2 * Math.PI, duration: 5, ease: 'power1.inOut', repeat: -1 })`,
      height: "400px",
    },
    {
      description: "阴影",
      code: `
 // 设置渲染器允许投射阴影
    renderer.shadowMap.enabled = true
      // 设置光投射阴影
    directionalLight.castShadow = true
      // 设置接收阴影和投射阴影
    planeMesh.receiveShadow = true
    planeMesh.castShadow = true`,
      height: "130px",
      theme: "vs-dark",
    },
    {
      description: "光",
      language: "javascript",
      code: `
    // 添加环境光
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambientLight)

    // 添加平行光
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(10, 10, 0)
    // 默认平行光的目标是原点
    directionalLight.target.position.set(0, 0, 0)
    scene.add(directionalLight)

    // 设置光投射阴影
    directionalLight.castShadow = true

    // 添加平行光辅助器
    let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
    scene.add(directionalLightHelper)`,
      height: "230px",
    },
    {
      description: `1. renderer.outputColorSpace = THREE.SRGBColorSpace <br>
解释: 这是在设置渲染器输出的颜色空间。<br>

例子: 想象你拍了一张彩色照片，然后你把它打印出来。如果打印机没有正确理解颜色信息，颜色看起来会很奇怪。THREE.SRGBColorSpace 就像一个标准，让渲染器正确显示颜色，就像你看到的真实世界那样。<br>

2. renderer.toneMapping = THREE.ACESFilmicToneMapping<br>
解释: 这是设置色调映射的方法，用于调整亮暗部分的过渡。<br>

例子: 你在非常明亮的阳光下拍照，结果照片中亮的部分太亮了，暗的部分太暗了。色调映射就像给照片加了一个滤镜，使得亮的部分和暗的部分过渡得更加自然和舒适。ACESFilmicToneMapping 是一种专业级别的滤镜，能产生电影般的效果。<br>

3. renderer.toneMappingExposure = 1<br>
解释: 这是调整整个场景的曝光度。<br>

例子: 曝光度就像相机的曝光设置。如果你设置的曝光度太高，照片会变得非常亮；如果设置太低，照片会变得很暗。这里的 1 表示正常的曝光度，你可以根据需要调高或调低。<br>

4. directionalLight.shadow.camera.left = -10<br>
5. directionalLight.shadow.camera.right = 10<br>
6. directionalLight.shadow.camera.top = 10<br>
7. directionalLight.shadow.camera.bottom = -10<br>
解释: 这些属性是设置光源投射阴影时的视图范围。<br>

例子: 想象你用一个手电筒照亮一个区域，你可以调整手电筒的照射范围，让它只照亮某个特定的区域。这里的 left、right、top 和 bottom 就是定义这个照射范围的边界。比如 left = -10 和 right = 10 表示光从左边 -10 到右边 10 的范围内照亮，top 和 bottom 类似。<br>

8. directionalLight.shadow.camera.near = 0.5<br>
9. directionalLight.shadow.camera.far = 50<br>
解释: 这些属性设置光源投射阴影的最近和最远距离。<br>

例子: 如果你在一个黑暗的房间里，用手电筒照东西，near 和 far 就像手电筒光照的最短和最长距离。near = 0.5 表示光从 0.5 单位距离开始投射阴影，far = 50 表示光最多能照到 50 单位远的地方。<br>

10. directionalLight.shadow.mapSize.width = 2048<br>
11. directionalLight.shadow.mapSize.height = 2048<br>
解释: 这些属性设置阴影贴图的分辨率。<br>

例子: 分辨率就像你电脑屏幕的像素，像素越高，图像越清晰。mapSize.width = 2048 和 mapSize.height = 2048 表示阴影贴图的宽度和高度分别为 2048 像素。更高的分辨率会产生更清晰的阴影，但是也会消耗更多的计算资源。<br>

这些设置和属性可以帮助你更好地控制 Three.js 场景的渲染效果，从而达到更逼真和美观的视觉效果。`,
      code: ``,
      height: "0px",
    },
    {
      description: `聚光灯`,
      code: `
    // 添加聚光灯
    let spotLight = new THREE.SpotLight(0xffffff, 2)
    spotLight.position.set(0, 10, 0)
    spotLight.target.position.set(0, 0, 0)
    spotLight.castShadow = true

    spotLight.angle = Math.PI / 8
    spotLight.distance = 100
    spotLight.penumbra = 0.5
    spotLight.decay = 2
    spotLight.shadow.mapSize.width = 2048
    spotLight.shadow.mapSize.height = 2048
    scene.add(spotLight)

    // 添加聚光灯辅助器
    let spotLightHelper = new THREE.SpotLightHelper(spotLight)
    scene.add(spotLightHelper)`,
      height: "120px",
    },

    {
      description: `点光源`,
      code: `
    // 添加点光源
let pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 5, 0);
pointLight.castShadow = true;
scene.add(pointLight);

pointLight.distance = 15;
pointLight.decay = 2;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
// 添加点光源辅助器
let pointLightHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointLightHelper);`,
      height: "120px",
    },

    {
      description: `相机阴影辅助器`,
      code: `
  let cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    scene.add(cameraHelper)`,
      height: "80px",
      theme: "vs-dark",
    },
    {
      description: `csm级联阴影设置`,
      language: "javascript",
      code: ` //CSM
    addControls()
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
    const params = {
      orthographic: false,
      fade: false,
      far: 1000,
      mode: 'practical',
      lightX: -1,
      lightY: -1,
      lightZ: -1,
      margin: 100,
      lightFar: 1000,
      lightNear: 1,
      autoUpdateHelper: true,
      updateHelper: function () {}
    }
    // 添加平行光
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(params.lightX, params.lightY, params.lightZ).normalize().multiplyScalar(-200)
    // 默认平行光的目标是原点
    directionalLight.target.position.set(0, 0, 0)
    scene.add(directionalLight)
    // 添加平行光辅助器
    let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
    scene.add(directionalLightHelper)
    let cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    scene.add(cameraHelper)

    let csm = new CSM({
      maxFar: params.far,
      cascades: 4,
      // mode: params.mode,
      parent: scene,
      shadowMapSize: 1024,
      lightDirection: new THREE.Vector3(params.lightX, params.lightY, params.lightZ).normalize(),
      camera: camera
    })
    csm.fade = true
    csm.updateFrustums()
    function nowanimate() {
      requestRef.current = requestAnimationFrame(nowanimate) // 更新 ref 的当前值
      csm.update()
    }
    nowanimate()
    // 创建GUI
    const gui = new GUI()

    // rgbeLoader 加载hdr贴图
    let rgbeLoader = new RGBELoader()
    rgbeLoader.load('/texture/Video_Copilot-Back Light_0007_4k.hdr', envMap => {
      // 设置球形贴图
      envMap.mapping = THREE.EquirectangularReflectionMapping
      // envMap.mapping = THREE.EquirectangularRefractionMapping;
      // 设置环境贴图
      scene.background = envMap
      // 设置环境贴图
      // scene.environment = envMap;
    })

    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16)
    const material1 = new THREE.MeshPhysicalMaterial({
      color: 0xccccff
    })
    csm.setupMaterial(material1)
    const torusKnot = new THREE.Mesh(geometry, material1)
    torusKnot.position.set(4, 0, 0)
    scene.add(torusKnot)
    torusKnot.receiveShadow = true
    torusKnot.castShadow = true

    let sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
    const material2 = new THREE.MeshPhysicalMaterial({
      color: 0xffffff
    })
    csm.setupMaterial(material2)
    const sphere = new THREE.Mesh(sphereGeometry, material2)
    sphere.castShadow = true
    sphere.receiveShadow = true
    scene.add(sphere)

    let boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    const material3 = new THREE.MeshPhysicalMaterial({
      color: 0xffcccc
    })
    csm.setupMaterial(material3)
    const box = new THREE.Mesh(boxGeometry, material3)
    box.position.set(-4, 0, 0)
    scene.add(box)
    box.receiveShadow = true
    box.castShadow = true

    // 创建平面
    let planeGeometry = new THREE.PlaneGeometry(24, 24, 1, 1)
    let planeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x999999
    })
    csm.setupMaterial(planeMaterial)
    let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
    planeMesh.rotation.x = -Math.PI / 2
    planeMesh.position.set(0, -1, 0)
    scene.add(planeMesh)
    // 设置接收阴影
    planeMesh.receiveShadow = true
    planeMesh.castShadow = true

    // 添加环境光
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambientLight)
    gui.add(sphere.position, 'z', -10, 10).name('z')
    gui.add(csm, 'fade').onChange(value => {
      csm.fade = value
      csm.updateFrustums()
    })`,
      height: "280px",
      theme: "vs-dark",
    },
  ]),
  gui = new GUI();
console.log(gsap);
onMounted(() => {
  nextTick(() => {
    fncamera();
    rendererfn();
    animate();
    addControls();
    windowinit();
    // // 创建几何体
    // const geometry = new THREE.BoxGeometry(1, 1, 1),
    //   // 创建材质
    //   material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
    //   // 创建网格
    //   cube = new THREE.Mesh(geometry, material);
    // //gasp
    // // 设置动画
    // let animate1 = gsap.to(cube.position, {
    //     x: 3,
    //     duration: 5,
    //     ease: "power1.inOut",
    //     //   设置重复的次数，无限次循环-1
    //     repeat: -1,
    //     //   往返运动
    //     yoyo: true,
    //     //   delay，延迟2秒运动
    //     delay: 2,
    //     onComplete: () => {
    //       console.log("动画完成");
    //     },
    //     onStart: () => {
    //       console.log("动画开始");
    //     },
    //   }),
    //   timeout: any;
    // const debounceTime = 300; // 防抖时间间隔，可以根据需要调整

    // window.addEventListener("dblclick", () => {
    //   clearTimeout(timeout); // 清除之前的定时器
    //   timeout = setTimeout(() => {
    //     // 判断动画状态，并进行相应的暂停或恢复
    //     if (animate1.isActive()) {
    //       animate1.pause(); // 暂停动画
    //     } else {
    //       animate1.resume(); // 恢复动画
    //     }
    //   }, debounceTime); // 延迟执行的时间（毫秒）
    // });

    // gsap.to(cube.rotation, {
    //   x: 2 * Math.PI,
    //   duration: 5,
    //   ease: "power1.inOut",
    //   repeat: -1,
    // });
    // // 将网格添加到场景中
    // scene.add(cube);
    // //阴影
    // // 设置渲染器允许投射阴影
    // renderer.shadowMap.enabled = true;
    // renderer.outputColorSpace = THREE.SRGBColorSpace;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1;
    // // rgbeLoader 加载hdr贴图
    // let rgbeLoader = new RGBELoader();
    // rgbeLoader.load(
    //   "/texture/Video_Copilot-Back Light_0007_4k.hdr",
    //   (envMap) => {
    //     if (window.location.pathname !== "/viewDemo/one/Light") {
    //       return;
    //     }
    //     // 设置球形贴图
    //     envMap.mapping = THREE.EquirectangularReflectionMapping;
    //     // envMap.mapping = THREE.EquirectangularRefractionMapping;
    //     // 设置环境贴图
    //     scene.background = envMap;
    //     // 设置环境贴图
    //     // scene.environment = envMap;
    //   }
    // );
    // const geometry1 = new THREE.TorusKnotGeometry(1, 0.3, 100, 16),
    //   material1 = new THREE.MeshPhysicalMaterial({
    //     color: 0xccccff,
    //   });
    // let alphaTexture = new THREE.TextureLoader().load(
    //   "/texture/16.jpg"
    // );
    // const torusKnot = new THREE.Mesh(geometry1, material1);
    // torusKnot.position.set(4, 1, 0);
    // torusKnot.receiveShadow = true;
    // torusKnot.castShadow = true;
    // scene.add(torusKnot);
    // let sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    // const material2 = new THREE.MeshPhysicalMaterial({
    //     color: 0xffffff,
    //   }),
    //   sphere = new THREE.Mesh(sphereGeometry, material2);
    // sphere.castShadow = true;
    // sphere.receiveShadow = true;
    // scene.add(sphere);

    // let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    // const material3 = new THREE.MeshPhysicalMaterial({
    //     color: 0xffcccc,
    //     alphaMap: alphaTexture,
    //     transparent: true,
    //     side: THREE.DoubleSide,
    //     alphaTest: 0.5,
    //     shadowSide: THREE.BackSide,
    //   }),
    //   box = new THREE.Mesh(boxGeometry, material3);
    // box.position.set(-4, 0, 0);
    // box.castShadow = true;
    // box.receiveShadow = true;
    // scene.add(box);
    // // 创建平面
    // let planeGeometry = new THREE.PlaneGeometry(24, 24, 1, 1),
    //   planeMaterial = new THREE.MeshPhysicalMaterial({
    //     color: 0x999999,
    //   }),
    //   planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    // planeMesh.rotation.x = -Math.PI / 2;
    // planeMesh.position.set(0, -1, 0);
    // scene.add(planeMesh);
    // // 设置接收阴影
    // planeMesh.receiveShadow = true;
    // planeMesh.castShadow = true;

    // // 添加环境光
    // let ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    // scene.add(ambientLight);

    // // 添加平行光
    // let directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    // directionalLight.position.set(10, 10, 0);
    // // 默认平行光的目标是原点
    // directionalLight.target.position.set(0, 0, 0);
    // scene.add(directionalLight);

    // // 设置光投射阴影
    // directionalLight.castShadow = true;

    // // 添加平行光辅助器
    // let directionalLightHelper = new THREE.DirectionalLightHelper(
    //   directionalLight
    // );
    // scene.add(directionalLightHelper);

    // gui.add(sphere.position, "z", -10, 10).name("z");
    // directionalLight.shadow.camera.left = -10;
    // directionalLight.shadow.camera.right = 10;
    // directionalLight.shadow.camera.top = 10;
    // directionalLight.shadow.camera.bottom = -10;
    // directionalLight.shadow.camera.near = 0.5;
    // directionalLight.shadow.camera.far = 50;
    // // 设置阴影的纹理大小
    // directionalLight.shadow.mapSize.width = 2048;
    // directionalLight.shadow.mapSize.height = 2048;
    // // 添加聚光灯
    // let spotLight = new THREE.SpotLight(0xffffff, 2);
    // spotLight.position.set(0, 10, 0);
    // spotLight.target.position.set(0, 0, 0);
    // spotLight.castShadow = true;

    // spotLight.angle = Math.PI / 8;
    // spotLight.distance = 100;
    // spotLight.penumbra = 0.5;
    // spotLight.decay = 2;
    // spotLight.shadow.mapSize.width = 2048;
    // spotLight.shadow.mapSize.height = 2048;
    // scene.add(spotLight);

    // // 添加聚光灯辅助器
    // let spotLightHelper = new THREE.SpotLightHelper(spotLight);
    // scene.add(spotLightHelper);
    // // 添加点光源
    // let pointLight = new THREE.PointLight(0xffffff, 1);
    // pointLight.position.set(0, 5, 0);
    // pointLight.castShadow = true;
    // scene.add(pointLight);

    // pointLight.distance = 15;
    // pointLight.decay = 2;
    // pointLight.shadow.mapSize.width = 2048;
    // pointLight.shadow.mapSize.height = 2048;
    // // 添加点光源辅助器
    // let pointLightHelper = new THREE.PointLightHelper(pointLight);
    // scene.add(pointLightHelper);

    //CSM
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    const params = {
      orthographic: false,
      fade: false,
      far: 1000,
      mode: "practical",
      lightX: -1,
      lightY: -1,
      lightZ: -1,
      margin: 100,
      lightFar: 1000,
      lightNear: 1,
      autoUpdateHelper: true,
      updateHelper: function () {},
    };
    // 添加平行光
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position
      .set(params.lightX, params.lightY, params.lightZ)
      .normalize()
      .multiplyScalar(-200);
    // 默认平行光的目标是原点
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    // 添加平行光辅助器
    let directionalLightHelper = new THREE.DirectionalLightHelper(
      directionalLight
    );
    scene.add(directionalLightHelper);
    let cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(cameraHelper);

    let csm = new CSM({
      maxFar: params.far,
      cascades: 4,
      // mode: params.mode,
      parent: scene,
      shadowMapSize: 1024,
      lightDirection: new THREE.Vector3(
        params.lightX,
        params.lightY,
        params.lightZ
      ).normalize(),
      camera: camera,
    });
    csm.fade = true;
    csm.updateFrustums();
    function nowanimate() {
      requestRef.value = requestAnimationFrame(nowanimate); // 更新 ref 的当前值
      csm.update();
    }
    nowanimate();

    // rgbeLoader 加载hdr贴图
    let rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      "/texture/Video_Copilot-Back Light_0007_4k.hdr",
      (envMap) => {
        if (window.location.pathname !== "/viewDemo/one/Light") {
          return;
        }
        // 设置球形贴图
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        // envMap.mapping = THREE.EquirectangularRefractionMapping;
        // 设置环境贴图
        scene.background = envMap;
        // 设置环境贴图
        // scene.environment = envMap;
      }
    );

    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16),
      material1 = new THREE.MeshPhysicalMaterial({
        color: 0xccccff,
      });
    csm.setupMaterial(material1);
    const torusKnot = new THREE.Mesh(geometry, material1);
    torusKnot.position.set(4, 0, 0);
    scene.add(torusKnot);
    torusKnot.receiveShadow = true;
    torusKnot.castShadow = true;

    let sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const material2 = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
    });
    csm.setupMaterial(material2);
    const sphere = new THREE.Mesh(sphereGeometry, material2);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const material3 = new THREE.MeshPhysicalMaterial({
      color: 0xffcccc,
    });
    csm.setupMaterial(material3);
    const box = new THREE.Mesh(boxGeometry, material3);
    box.position.set(-4, 0, 0);
    scene.add(box);
    box.receiveShadow = true;
    box.castShadow = true;

    // 创建平面
    let planeGeometry = new THREE.PlaneGeometry(24, 24, 1, 1),
      planeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x999999,
      });
    csm.setupMaterial(planeMaterial);
    let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.position.set(0, -1, 0);
    scene.add(planeMesh);
    // 设置接收阴影
    planeMesh.receiveShadow = true;
    planeMesh.castShadow = true;

    // 添加环境光
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    gui.add(sphere.position, "z", -10, 10).name("z");
    gui.add(csm, "fade").onChange((value) => {
      csm.fade = value;
      csm.updateFrustums();
    });
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
  scene.background = null;
  gui.destroy();
  scene.clear();

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
