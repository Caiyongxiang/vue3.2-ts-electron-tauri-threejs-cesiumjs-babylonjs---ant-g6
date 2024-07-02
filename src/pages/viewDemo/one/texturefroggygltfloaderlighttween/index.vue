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
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// 导入hdr加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 导入gltf加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入draco解码器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// 导入tween
import * as TWEEN from "three/examples/jsm/libs/tween.module.js";
import getGlobalOffsetLeft from "../../../../common/three/getGlobalOffsetLeft";
const drawer = ref(false),
  requestRef = ref<number | null>(null),
  tipArr = ref([
    {
      description: `HDR贴图（High Dynamic Range Image）<br>
解释: HDR贴图记录了从非常暗到非常亮的更多光照信息，比普通图片能显示的范围要广。<br>

举例: 想象你在阳光明媚的海滩拍照，普通照片可能会让天空过曝，海滩太暗。而HDR贴图可以同时展示天空的蓝色和海滩的细节。<br>

球形贴图（Spherical Mapping）<br>
解释: 就是把一张图片包裹到一个球体上，像给球体贴上皮肤一样。<br>

举例: 想象你有一张地球仪的地图，把这张地图贴到一个球上，就形成了一个地球仪。<br>

环境贴图（Environment Map）<br>
解释: 让物体反射周围环境的贴图。<br>

举例: 如果你有一个镜子，你会看到镜子反射周围的东西。环境贴图就像给一个物体（比如一个金属球）赋予类似的反射效果。<br>

AO贴图（Ambient Occlusion Map）<br>
解释: 模拟物体之间和内部的阴影，使物体看起来更真实。<br>

举例: 把一个盒子放在桌子上，盒子和桌子接触的地方会有阴影。AO贴图就是让这些地方看起来有阴影，增加深度感。<br>

强度（aoMapIntensity）: 控制阴影的深浅，数值越大，阴影越明显。<br>

高光贴图（Specular Map）<br>
解释: 控制物体表面哪些部分反光。<br>

举例: 想象你有一双皮鞋，鞋尖很亮，鞋底是哑光的。高光贴图可以让鞋尖部分看起来更亮，而鞋底部分则不会反光。<br>

three.js中的具体用法<br>
envMap.mapping: 设置环境贴图的类型，决定如何把图片贴到物体上。<br>
scene.background: 设置场景的背景，比如你在一个3D世界里可以用一张图片作为背景。<br>
scene.environment = envMap: 用环境贴图设置整个场景的光照和反射效果。<br>
planeMaterial.envMap = envMap: 把环境贴图应用到某个物体的材质上，让它有环境反射效果。<br>
aoMap: 给材质添加AO贴图，增加阴影细节。<br>
aoMapIntensity: 调整AO贴图的阴影强度。<br>
lightMap: 给材质添加光照贴图，模拟光源照射效果。<br>
specularMap: 给材质添加高光贴图，控制反光区域。<br>
reflectivity: 设置材质的反射率，数值越大，反射效果越强。<br>
举例:<br>

envMap.mapping: 把一张天空的全景图像包裹在一个球上，模拟天空。<br>
scene.background: 设置背景图像为蓝天白云。<br>
scene.environment = envMap: 让整个场景在这个天空环境中。<br>
planeMaterial.envMap = envMap: 让一块玻璃板反射这个天空环境。<br>
aoMap: 给桌子加上AO贴图，让桌子脚和桌面接触的地方看起来有阴影。<br>
aoMapIntensity: 调整这个阴影的深浅。<br>
lightMap: 给房间加上灯光贴图，模拟灯光照在墙上的效果。<br>
specularMap: 给金属球加上高光贴图，让球的某些部分看起来更亮。<br>
reflectivity: 调整金属球的反射效果，让它看起来更像镜子或更像哑光金属。`,
      code: ` // 创建纹理加载器
    let textureLoader = new THREE.TextureLoader()
    // 加载纹理
    let texture = textureLoader.load('/texture/watercover/CityNewYork002_COL_VAR1_1K.png')
    // 加载ao贴图
    let aoMap = textureLoader.load('../../../texture/watercover/CityNewYork002_AO_1K.jpg')

    // 透明度贴图
    let alphaMap = textureLoader.load('../../../texture/door/height.jpg')

    // 光照贴图
    let lightMap = textureLoader.load('../../../texture/colors.png')

    // 高光贴图
    let specularMap = textureLoader.load('../../../texture/watercover/CityNewYork002_GLOSS_1K.jpg')
    addControls()
    // rgbeLoader 加载hdr贴图
    let rgbeLoader = new RGBELoader()
    rgbeLoader.load('../../texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
      // 设置球形贴图
      envMap.mapping = THREE.EquirectangularReflectionMapping
      // 设置环境贴图
      scene.background = envMap
      // 设置环境贴图
      scene.environment = envMap
      // 设置plane的环境贴图
      planeMaterial.envMap = envMap
    })
    let planeGeometry = new THREE.PlaneGeometry(1, 1)
    let planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture,
      // 允许透明
      transparent: true,
      // 设置ao贴图
      aoMap: aoMap,
      aoMapIntensity: 1,
      // 透明度贴图
      // alphaMap: alphaMap,
      // 设置光照贴图
      // lightMap: lightMap,
      // 设置高光贴图
      specularMap: specularMap,
      reflectivity: 0.5
    })
    // planeMaterial.map = texture;
    let plane = new THREE.Mesh(planeGeometry, planeMaterial)
    scene.add(plane)`,
      height: "400px",
    },
    {
      description: `色彩空间切换  通俗易懂的比较 <br>
sRGB:<br>
更适合于显示和观看图像。<br>
比如你在手机、电脑或电视上看照片或视频，sRGB 是默认的色彩空间，使图像看起来更自然。<br>
Linear:<br>

更适合于图像处理和计算。<br>
比如在 3D 渲染过程中，使用 Linear 色彩空间可以更准确地计算光照和颜色混合效果，最终生成的图像可以转换回 sRGB 进行显示。<br>
实际应用中的对比<br>
摄影和显示:<br>

你用数码相机拍了一张照片，并在电脑上查看。这时，你希望图像在不同设备上的显示效果尽可能一致，所以使用 sRGB 色彩空间。<br>
3D 渲染:<br>

你在使用 3D 软件创建一个虚拟场景，并且需要计算光照和反射等效果。在这个过程中，使用 Linear 色彩空间可以确保计算的准确性。完成渲染后，再将图像转换成 sRGB 进行显示。<br>
通过上述解释和举例，希望你能更好地理解 sRGB 和 Linear 两种色彩空间的概念及其应用场景。`,
      code: `gui
      .add(texture, 'colorSpace', {
        sRGB: THREE.SRGBColorSpace,
        Linear: THREE.LinearSRGBColorSpace
      })
      .onChange(() => {
        texture.needsUpdate = true
      })`,
      height: "100px",
    },
    {
      description: `场景雾（Linear Fog）<br>
场景雾是指雾的浓度随距离线性变化的一种雾效。也就是说，距离摄像机越远的物体，被雾笼罩的程度越高。
举例：<br>
假设你在游戏中看到一片森林，距离你近的树木看得很清晰，随着你视线向远方延伸，树木开始逐渐被雾笼罩，变得模糊。近处的树木清晰可见，远处的树木则因为雾的影响显得朦胧，这是场景雾的效果。
<br>
指数雾（Exponential Fog）<br>
举例：<br>
在同样的游戏森林场景中，随着你视线向远方延伸，树木被雾笼罩的程度更为自然、平滑。即使在近处，雾的效果也会有所体现，但不会像线性雾那样突然变化，而是逐渐加强。这就是指数雾的效果。`,
      code: `scene.fog = new THREE.Fog(0x999999, 0.1, 50)
    // 创建场景指数fog
    // scene.fog = new THREE.FogExp2(0x999999, 0.1);
    // scene.background = new THREE.Color(0x999999)`,
      height: "100px",
    },
    {
      description: `加载gltf模型 和进过draco的模型`,
      code: ` // 实例化加载器gltf
    const gltfLoader = new GLTFLoader()
    // 加载模型
    gltfLoader.load(
      // 模型路径
      '../../model/Duck.glb',
      // 加载完成回调
      gltf => {
        console.log(gltf)
        scene.add(gltf.scene)
      }
    )

    // 实例化加载器draco
    const dracoLoader = new DRACOLoader()
    // 设置draco路径
    dracoLoader.setDecoderPath('../../draco/')
    // 设置gltf加载器draco解码器
    gltfLoader.setDRACOLoader(dracoLoader)

    gltfLoader.load(
      // 模型路径
      '../../model/city.glb',
      // 加载完成回调
      gltf => {
        // console.log(gltf);
        scene.add(gltf.scene)
      }
    )`,
      height: "180px",
    },
    {
      description: `射线获取模型`,
      code: `// 创建三个球
    const sphere1 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00
      })
    )
    sphere1.position.x = -4
    scene.add(sphere1)

    const sphere2 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x0000ff
      })
    )

    scene.add(sphere2)

    const sphere3 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff00ff
      })
    )

    sphere3.position.x = 4
    scene.add(sphere3)
    // 创建射线
    const raycaster = new THREE.Raycaster()
    // 创建鼠标向量
    const mouse = new THREE.Vector2()


    window.addEventListener('click', event => {
        console.log(event.clientX, event.clientY)
        // 设置鼠标向量的x,y值
          // 设置鼠标向量的x,y值
      mouse.x =
        ((event.clientX -
          Number(
            getGlobalOffsetLeft(document.getElementsByClassName("cyxScene")[0])
              .totalOffsetLeft
          )) /
          (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
            .offsetWidth) *
          2 -
        1;
      mouse.y = -(
        ((event.clientY -
          Number(
            getGlobalOffsetLeft(document.getElementsByClassName("cyxScene")[0])
              .totalOffsetTop
          )) /
          (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
            .offsetHeight) *
          2 -
        1
      );
  
        // console.log(mouse.x, mouse.y);
        // 通过摄像机和鼠标位置更新射线
        raycaster.setFromCamera(mouse, camera)
  
        // 计算物体和射线的焦点
        const intersects = raycaster.intersectObjects([sphere1, sphere2, sphere3]) as any
  
        if (intersects.length > 0) {
          // console.log(intersects[0].object);
          if (intersects[0].object._isSelect) {
            console.log(intersects[0].object._originColor)
            intersects[0].object.material.color.set(intersects[0].object._originColor)
            intersects[0].object._isSelect = false
            return
          }
  
          intersects[0].object._isSelect = true
          intersects[0].object._originColor = intersects[0].object.material.color.getHex()
          intersects[0].object.material.color.set(0xff0000)
        }
  
        console.log(intersects)
      })`,
      height: "320px",
    },
  ]),
  // 创建GUI
  gui = new GUI();

onMounted(() => {
  nextTick(() => {
    fncamera();
    rendererfn();
    animate();
    addControls();
    // 创建纹理加载器
    let textureLoader = new THREE.TextureLoader(),
      // 加载纹理
      texture = textureLoader.load(
        "/texture/watercover/CityNewYork002_COL_VAR1_1K.png"
      ),
      // 加载ao贴图
      aoMap = textureLoader.load(
        "../../../texture/watercover/CityNewYork002_AO_1K.jpg"
      ),
      // 透明度贴图
      //   alphaMap = textureLoader.load("../../../texture/door/height.jpg"),
      // 光照贴图
      //   lightMap = textureLoader.load("../../../texture/colors.png"),
      // 高光贴图
      specularMap = textureLoader.load(
        "../../../texture/watercover/CityNewYork002_GLOSS_1K.jpg"
      );
    addControls();
    // rgbeLoader 加载hdr贴图
    let rgbeLoader = new RGBELoader(),
      planeGeometry = new THREE.PlaneGeometry(1, 1),
      planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture,
        // 允许透明
        transparent: true,
        // 设置ao贴图
        aoMap: aoMap,
        aoMapIntensity: 1,
        // 透明度贴图
        // alphaMap: alphaMap,
        // 设置光照贴图
        // lightMap: lightMap,
        // 设置高光贴图
        specularMap: specularMap,
        reflectivity: 0.5,
      });
    rgbeLoader.load(
      "../../texture/Alex_Hart-Nature_Lab_Bones_2k.hdr",
      (envMap) => {
        // 设置球形贴图
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        // 设置环境贴图
        scene.background = envMap;
        // 设置环境贴图
        scene.environment = envMap;
        // 设置plane的环境贴图
        planeMaterial.envMap = envMap;
      }
    );

    // planeMaterial.map = texture;
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(3, 3, 0);
    scene.add(plane);
    gui
      .add(texture, "colorSpace", {
        sRGB: THREE.SRGBColorSpace,
        Linear: THREE.LinearSRGBColorSpace,
      })
      .onChange(() => {
        texture.needsUpdate = true;
      });

    gui.add(planeMaterial, "aoMapIntensity").min(0).max(1).name("ao强度");
    scene.fog = new THREE.Fog(0x999999, 0.1, 50);
    // 实例化加载器gltf
    const gltfLoader = new GLTFLoader();
    // 加载模型
    gltfLoader.load(
      // 模型路径
      "../../model/Duck.glb",
      // 加载完成回调
      (gltf) => {
        console.log(gltf);
        scene.add(gltf.scene);
      }
    );

    // 实例化加载器draco
    const dracoLoader = new DRACOLoader();
    // 设置draco路径
    dracoLoader.setDecoderPath("../../draco/");
    // 设置gltf加载器draco解码器
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      // 模型路径
      "../../model/city.glb",
      // 加载完成回调
      (gltf) => {
        // console.log(gltf);
        scene.add(gltf.scene);
      }
    );
    // 创建三个球
    const sphere1 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
      })
    );
    sphere1.position.x = -4;
    scene.add(sphere1);

    const sphere2 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x0000ff,
      })
    );

    scene.add(sphere2);

    const sphere3 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff00ff,
      })
    );

    sphere3.position.x = 4;
    scene.add(sphere3);
    // 创建射线
    const raycaster = new THREE.Raycaster(),
      // 创建鼠标向量
      mouse = new THREE.Vector2();

    window.addEventListener("click", (event) => {
      console.log(event.clientX, event.clientY);
      // 设置鼠标向量的x,y值
      mouse.x =
        ((event.clientX -
          Number(
            getGlobalOffsetLeft(document.getElementsByClassName("cyxScene")[0])
              .totalOffsetLeft
          )) /
          (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
            .offsetWidth) *
          2 -
        1;
      mouse.y = -(
        ((event.clientY -
          Number(
            getGlobalOffsetLeft(document.getElementsByClassName("cyxScene")[0])
              .totalOffsetTop
          )) /
          (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
            .offsetHeight) *
          2 -
        1
      );

      // console.log(mouse.x, mouse.y);
      // 通过摄像机和鼠标位置更新射线
      raycaster.setFromCamera(mouse, camera);

      // 计算物体和射线的焦点
      const intersects = raycaster.intersectObjects([
        sphere1,
        sphere2,
        sphere3,
      ]) as any;

      if (intersects.length > 0) {
        // console.log(intersects[0].object);
        if (intersects[0].object._isSelect) {
          console.log(intersects[0].object._originColor);
          intersects[0].object.material.color.set(
            intersects[0].object._originColor
          );
          intersects[0].object._isSelect = false;
          return;
        }

        intersects[0].object._isSelect = true;
        intersects[0].object._originColor =
          intersects[0].object.material.color.getHex();
        intersects[0].object.material.color.set(0xff0000);
      }

      console.log(intersects);
    });
    const tween = new TWEEN.Tween(sphere1.position);
    tween.to({ x: 40 }, 1000);
    tween.onUpdate(() => {
      console.log(sphere1.position.x);
    });
    // 设置循环无数次
    // tween.repeat(Infinity);
    // 循环往复
    // tween.yoyo(true);
    // tween.repeat(2);
    // tween.delay(3000);
    // 设置缓动函数
    tween.easing(TWEEN.Easing.Quadratic.InOut);

    let tween2 = new TWEEN.Tween(sphere1.position);
    tween2.to({ x: -40 }, 10000);

    tween.chain(tween2);
    tween2.chain(tween);
    // 启动补间动画
    tween.start();
    tween.onStart(() => {
      console.log("开始");
    });
    tween.onComplete(() => {
      console.log("结束");
    });
    tween.onStop(() => {
      console.log("停止");
    });
    tween.onUpdate(() => {
      console.log("更新");
    });
    let params = {
      stop: function () {
        tween.stop();
      },
    };

    gui.add(params, "stop");

    function nowanimate() {
      requestRef.value = requestAnimationFrame(nowanimate); // 更新 ref 的当前值
      TWEEN.update();
    }
    nowanimate();
  });
});
onBeforeUnmount(() => {
  if (requestRef.value !== null) {
    cancelAnimationFrame(requestRef.value);
  }
  scene.fog = null;
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
