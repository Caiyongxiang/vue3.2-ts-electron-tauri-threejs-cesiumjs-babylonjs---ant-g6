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
// 导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
// 导入rgbmloader
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const drawer = ref(false),
  requestRef = ref<number | null>(null),
  tipArr = ref([
    {
      description: "纹理位移_旋转_缩放_重复",
      code: `  texture.repeat.set(4, 4);
    // // 设置水平重复
    texture.wrapS = THREE.RepeatWrapping;
    // // 设置水平的重复方式为镜像重复
    texture.wrapS = THREE.MirroredRepeatWrapping;
    // // 设置垂直重复
    texture.wrapT = THREE.RepeatWrapping;

    // 纹理偏移
    texture.offset.set(0.5, 0.5);

    // 纹理旋转
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 4;`,
      height: "230px",
    },
    {
      description: "色调映射曝光度和色调曝光度",
      code: `    // 设置色调映射
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 设置色调映射曝光度
    renderer.toneMappingExposure = 1;
    gui.add(renderer, "toneMapping", {
      // 无色调映射
      No: THREE.NoToneMapping,
      // 线性色调映射
      Linear: THREE.LinearToneMapping,
      // Reinhard色调映射。这是一种更复杂的色调映射方式，可以更好地处理高亮度的区域。它根据整个图像的平均亮度来调整每个像素的亮度。
      Reinhard: THREE.ReinhardToneMapping,
      // Cineon色调映射。这种方法起源于电影行业，尝试模仿电影胶片的颜色响应，使得图像在颜色上看起来更富有电影感。
      Cineon: THREE.CineonToneMapping,
      // ACES Filmic色调映射。这是一种模仿电影行业中常用的色调映射算法，可以产生类似于电影的视觉效果。
      ACESFilmic: THREE.ACESFilmicToneMapping,
    });
    gui.add(renderer, "toneMappingExposure", 0, 3, 0.1);`,
      height: "230px",
    },
    {
      description: "深度模式_深度写入_深度检测",
      code: `   // 创建平面
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({
  // map: new THREE.TextureLoader().load("./texture/brick/brick_diffuse.jpg"),
  map: new THREE.TextureLoader().load("./texture/sprite0.png"),
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.renderOrder = 0;
scene.add(plane);
// 创建平面2
const planeGeometry1 = new THREE.PlaneGeometry(10, 10);
const planeMaterial1 = new THREE.MeshBasicMaterial({
  map: new THREE.TextureLoader().load("./texture/lensflare0_alpha.png"),
  side: THREE.DoubleSide,
});
const plane1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
plane1.position.z = 3;
plane1.renderOrder = 0;
scene.add(plane1);

// 设置2个材质为透明
plane.material.transparent = true;
plane1.material.transparent = true;

// 设置深度模式
plane.material.depthFunc = THREE.LessEqualDepth;
plane.material.depthWrite = true;
plane.material.depthTest = true;
plane1.material.depthFunc = THREE.LessEqualDepth;
plane1.material.depthWrite = true;
plane1.material.depthTest = true;

// gui
const gui1 = gui.addFolder("plane");
gui1
  .add(plane.material, "depthFunc", {
    "THREE.NeverDepth": THREE.NeverDepth,
    "THREE.AlwaysDepth": THREE.AlwaysDepth,
    "THREE.LessDepth": THREE.LessDepth,
    "THREE.LessEqualDepth": THREE.LessEqualDepth,
    "THREE.GreaterEqualDepth": THREE.GreaterEqualDepth,
    "THREE.GreaterDepth": THREE.GreaterDepth,
    "THREE.NotEqualDepth": THREE.NotEqualDepth,
  })
  .name("深度模式");
gui1
  .add(plane.material, "depthWrite")
  .name("深度写入")
  .onChange(() => {
    plane.material.needsUpdate = true;
  });
gui1
  .add(plane.material, "depthTest")
  .name("深度测试")
  .onChange(() => {
    plane.material.needsUpdate = true;
  });

gui1.add(plane, "renderOrder", 0, 10).step(1).name("渲染顺序");

const gui2 = gui.addFolder("plane1");
gui2
  .add(plane1.material, "depthFunc", {
    "THREE.NeverDepth": THREE.NeverDepth,
    "THREE.AlwaysDepth": THREE.AlwaysDepth,
    "THREE.LessDepth": THREE.LessDepth,
    "THREE.LessEqualDepth": THREE.LessEqualDepth,
    "THREE.GreaterEqualDepth": THREE.GreaterEqualDepth,
    "THREE.GreaterDepth": THREE.GreaterDepth,
    "THREE.NotEqualDepth": THREE.NotEqualDepth,
  })
  .name("深度模式");
gui2
  .add(plane1.material, "depthWrite")
  .name("深度写入")
  .onChange(() => {
    plane1.material.needsUpdate = true;
  });
gui2
  .add(plane1.material, "depthTest")
  .name("深度测试")
  .onChange(() => {
    plane1.material.needsUpdate = true;
  });

gui2.add(plane1, "renderOrder", 0, 10).step(1).name("渲染顺序");`,
      height: "230px",
    },
    {
      description: `depthFunc（深度模式）
草地: 设置为 THREE.LessEqualDepth。这意味着只有当草地的深度值（与相机的距离）小于或等于已经绘制的像素的深度值时，草地才会被绘制。<br>
水面: 如果我们设置为 THREE.GreaterEqualDepth，那么只有当水面的深度值大于已经绘制的像素的深度值时，水面才会被绘制。<br>
举例：这就好比两个图层，草地是上面的图层，水面是下面的图层。深度模式帮助决定哪个图层应该覆盖哪个。<br>

depthWrite（深度写入）<br>
草地: depthWrite = true，这意味着草地会将它的深度信息写入深度缓冲区，告诉其他物体“我在这个位置”。<br>
水面: 如果设置为 false，水面就不会写入深度信息，这样就不会影响其他物体的深度测试。<br>
举例：草地告诉场景，“我在这里，别的东西不应该画在我上面”。而水面则说，“我不太重要，即使你在我下面也可以画”。<br>

depthTest（深度测试）<br>
草地: depthTest = true，草地会进行深度测试，确保它只在应该出现的地方绘制。<br>
水面: 同样设置为 true，这样水面也会检查是否应该覆盖其他物体。<br>
举例：深度测试就像是两个物体在比较谁更接近相机，只有更近的那个才会被看到。<br>

blending（混合模式）<br>
水面: blending = THREE.CustomBlending，允许我们自定义混合模式，使水面看起来透明。<br>
blendEquationAlpha, blendSrcAlpha, blendDstAlpha: 这些设置决定了水面的透明度和混合效果。例如，blendSrcAlpha = THREE.OneFactor 和 blendDstAlpha = THREE.OneMinusSrcAlphaFactor 表示水面的新颜色将与旧颜色混合，根据新旧颜色的alpha值决定混合程度。
举例：混合模式就像是调色板，你可以调整颜色混合的方式，让水面看起来像镜子一样反射天空，同时保持一定的透明度，可以看到下方的草地。<br>

通过这些属性的组合，我们可以创造出一个既美观又符合物理逻辑的3D场景。草地覆盖在水面之上，而水面又能透出下方的景象，呈现逼真的视觉效果。`,
      code: `  // 创建平面
    let spriteTexture = new THREE.TextureLoader().load(
      "../../../texture/sprite0.png"
    );
    spriteTexture.colorSpace = THREE.SRGBColorSpace;
    const planeGeometry5 = new THREE.PlaneGeometry(10, 10),
      planeMaterial5 = new THREE.MeshBasicMaterial({
        map: spriteTexture,
        side: THREE.DoubleSide,
        transparent: true,
      }),
      plane5 = new THREE.Mesh(planeGeometry5, planeMaterial5);
    // plane.visible = false;
    plane5.renderOrder = 0;
    scene.add(plane5);
    plane5.position.set(10, 0, 0);
    // 设置深度模式
    plane5.material.depthFunc = THREE.LessEqualDepth;
    plane5.material.depthWrite = true;
    plane5.material.depthTest = true;

    let material = plane5.material;
    material.blending = THREE.CustomBlending;
    material.blendEquationAlpha = THREE.AddEquation;
    material.blendSrcAlpha = THREE.OneFactor;
    material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;

    // 设置混合方程式 最终颜色 = 源颜色 * 源因子 + 目标颜色 * 目标因子

    // gui
    gui
      .add(material, "blending", {
        NoBlending: THREE.NoBlending,
        NormalBlending: THREE.NormalBlending,
        AdditiveBlending: THREE.AdditiveBlending,
        SubtractiveBlending: THREE.SubtractiveBlending,
        MultiplyBlending: THREE.MultiplyBlending,
        CustomBlending: THREE.CustomBlending,
      })
      .name("blending");

    gui
      .add(material, "blendEquation", {
        AddEquation: THREE.AddEquation,
        SubtractEquation: THREE.SubtractEquation,
        ReverseSubtractEquation: THREE.ReverseSubtractEquation,
        MinEquation: THREE.MinEquation,
        MaxEquation: THREE.MaxEquation,
      })
      .name("blendEquation");

    gui
      .add(material, "blendSrc", {
        ZeroFactor: THREE.ZeroFactor,
        OneFactor: THREE.OneFactor,
        SrcColorFactor: THREE.SrcColorFactor,
        OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
        SrcAlphaFactor: THREE.SrcAlphaFactor,
        OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
        DstAlphaFactor: THREE.DstAlphaFactor,
        OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
        DstColorFactor: THREE.DstColorFactor,
        OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
        SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
      })
      .name("blendSrc");
    gui
      .add(material, "blendDst", {
        ZeroFactor: THREE.ZeroFactor,
        OneFactor: THREE.OneFactor,
        SrcColorFactor: THREE.SrcColorFactor,
        OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
        SrcAlphaFactor: THREE.SrcAlphaFactor,
        OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
        DstAlphaFactor: THREE.DstAlphaFactor,
        OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
        DstColorFactor: THREE.DstColorFactor,
        OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
        // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
      })
      .name("blendDst");

    gui
      .add(material, "blendEquationAlpha", {
        AddEquation: THREE.AddEquation,
        SubtractEquation: THREE.SubtractEquation,
        ReverseSubtractEquation: THREE.ReverseSubtractEquation,
        MinEquation: THREE.MinEquation,
        MaxEquation: THREE.MaxEquation,
      })
      .name("blendEquationAlpha");

    gui
      .add(material, "blendSrcAlpha", {
        ZeroFactor: THREE.ZeroFactor,
        OneFactor: THREE.OneFactor,
        SrcColorFactor: THREE.SrcColorFactor,
        OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
        SrcAlphaFactor: THREE.SrcAlphaFactor,
        OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
        DstAlphaFactor: THREE.DstAlphaFactor,
        OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
        DstColorFactor: THREE.DstColorFactor,
        OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
        SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
      })
      .name("blendSrcAlpha");
    gui.add(material, "blendDstAlpha", {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
      // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
    });`,
      height: "400px",
    },
    {
      description: `裁剪平面`,
      code: `  // 创建裁剪平面
  const plane6 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      // 创建第2个平面
      plane7 = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

    renderer.clippingPlanes = [plane6, plane7];
    const folder = gui.addFolder("裁剪平面");
    // 添加一个滑块
    folder.add(plane6, "constant", -10, 10).name("位置");
    // // 设置plane的normal属性
    folder.add(plane6.normal, "x", -1, 1).name("法向量x");
    folder.add(plane6.normal, "y", -1, 1).name("法向量y");
    folder.add(plane6.normal, "z", -1, 1).name("法向量z");`,
      height: "230px",
    },
    {
      description: `裁剪场景`,
      code: ` let params = {
  scissorWidth: window.innerWidth / 2,
};
function animate() {
  controls.update();
  requestAnimationFrame(animate);
  // 渲染
  renderer.setScissorTest(true);
  renderer.setScissor(0, 0, params.scissorWidth, window.innerHeight);
  renderer.render(scene, camera);
  renderer.setScissor(
    params.scissorWidth,
    0,
    window.innerWidth - params.scissorWidth,
    window.innerHeight
  );
  renderer.render(newScene, camera);
  renderer.setScissorTest(false);
}
  gui.add(params, "scissorWidth", 0, window.innerWidth);`,
      height: "230px",
    },
  ]),
  gui = new GUI();
onMounted(() => {
  nextTick(() => {
    fncamera();
    rendererfn();
    animate();
    addControls();
    windowinit();
    // 创建纹理加载器
    let textureLoader = new THREE.TextureLoader(),
      // 加载纹理
      texture = textureLoader.load("../../../texture/amber/base_color.jpg"),
      planeGeometry = new THREE.PlaneGeometry(1, 1),
      planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture,
        // 允许透明
        // transparent: true,
      }),
      // planeMaterial.map = texture;
      plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(1, 0, 0);
    scene.add(plane);
    texture.repeat.set(4, 4);
    // // 设置水平重复
    texture.wrapS = THREE.RepeatWrapping;
    // // 设置水平的重复方式为镜像重复
    texture.wrapS = THREE.MirroredRepeatWrapping;
    // // 设置垂直重复
    texture.wrapT = THREE.RepeatWrapping;

    // 纹理偏移
    texture.offset.set(0.5, 0.5);

    // 纹理旋转
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 4;
    // 加载纹理
    // let texture = textureLoader.load("./texture/uv_grid_opengl.jpg");
    let texture1 = textureLoader.load("../../../texture/rain.png"),
      planeGeometry1 = new THREE.PlaneGeometry(1, 1),
      planeMaterial1 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture1,
        // 允许透明
        transparent: true,
      }),
      plane1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
    plane.position.set(2, 0, 0);
    scene.add(plane1);
    let texture2 = textureLoader.load(
        "../../../texture/brick/brick_diffuse.jpg"
      ),
      // let texture = textureLoader.load("./texture/rain.png");
      planeGeometry2 = new THREE.PlaneGeometry(1, 1),
      planeMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture2,
        // 允许透明
        transparent: true,
      }),
      // planeMaterial.map = texture;
      plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
    plane2.position.set(3, 0, 0);
    texture2.colorSpace = THREE.SRGBColorSpace;
    texture2.minFilter = THREE.LinearMipMapLinearFilter;
    texture2.anisotropy = 4;
    scene.add(plane2);
    // texture.flipY = false;
    // texture.flipY = true
    // 设置色调映射
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 设置色调映射曝光度
    renderer.toneMappingExposure = 1;
    gui.add(renderer, "toneMapping", {
      // 无色调映射
      No: THREE.NoToneMapping,
      // 线性色调映射
      Linear: THREE.LinearToneMapping,
      // Reinhard色调映射。这是一种更复杂的色调映射方式，可以更好地处理高亮度的区域。它根据整个图像的平均亮度来调整每个像素的亮度。
      Reinhard: THREE.ReinhardToneMapping,
      // Cineon色调映射。这种方法起源于电影行业，尝试模仿电影胶片的颜色响应，使得图像在颜色上看起来更富有电影感。
      Cineon: THREE.CineonToneMapping,
      // ACES Filmic色调映射。这是一种模仿电影行业中常用的色调映射算法，可以产生类似于电影的视觉效果。
      ACESFilmic: THREE.ACESFilmicToneMapping,
    });
    gui.add(renderer, "toneMappingExposure", 0, 3, 0.1);
    // rgbeLoader 加载hdr贴图
    let rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      "../../../texture/Alex_Hart-Nature_Lab_Bones_2k.hdr",
      (envMap: any) => {
        if (window.location.pathname !== "/viewDemo/one/Texture") {
          return;
        }
        // 设置球形贴图
        // envMap.mapping = THREE.EquirectangularReflectionMapping;
        envMap.mapping = THREE.EquirectangularRefractionMapping;
        // 设置环境贴图
        scene.background = envMap;
        // 设置环境贴图
        scene.environment = envMap;
      }
    );

    function nowanimate() {
      requestRef.value = requestAnimationFrame(nowanimate); // 更新 ref 的当前值
    }
    nowanimate();
    // 创建平面
    const planeGeometry3 = new THREE.PlaneGeometry(10, 10),
      planeMaterial3 = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("../../../texture/sprite0.png"),
        side: THREE.DoubleSide,
      }),
      plane3 = new THREE.Mesh(planeGeometry3, planeMaterial3);
    plane3.renderOrder = 0;
    plane3.position.set(10, 0, 0);
    scene.add(plane3);
    // 创建平面2
    const planeGeometry4 = new THREE.PlaneGeometry(10, 10),
      planeMaterial4 = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(
          "../../../texture/lensflare0_alpha.png"
        ),
        side: THREE.DoubleSide,
      }),
      plane4 = new THREE.Mesh(planeGeometry4, planeMaterial4);
    plane4.position.z = 3;
    plane4.renderOrder = 0;
    plane4.position.set(10, 0, 0);
    scene.add(plane4);

    // 设置2个材质为透明
    plane3.material.transparent = true;
    plane4.material.transparent = true;

    // 设置深度模式
    plane3.material.depthFunc = THREE.LessEqualDepth;
    plane4.material.depthWrite = true;
    plane3.material.depthTest = true;
    plane4.material.depthFunc = THREE.LessEqualDepth;
    plane4.material.depthWrite = true;
    plane4.material.depthTest = true;

    // gui
    const gui1 = gui.addFolder("plane");
    gui1
      .add(plane3.material, "depthFunc", {
        "THREE.NeverDepth": THREE.NeverDepth,
        "THREE.AlwaysDepth": THREE.AlwaysDepth,
        "THREE.LessDepth": THREE.LessDepth,
        "THREE.LessEqualDepth": THREE.LessEqualDepth,
        "THREE.GreaterEqualDepth": THREE.GreaterEqualDepth,
        "THREE.GreaterDepth": THREE.GreaterDepth,
        "THREE.NotEqualDepth": THREE.NotEqualDepth,
      })
      .name("深度模式");
    gui1
      .add(plane3.material, "depthWrite")
      .name("深度写入")
      .onChange(() => {
        plane3.material.needsUpdate = true;
      });
    gui1
      .add(plane3.material, "depthTest")
      .name("深度测试")
      .onChange(() => {
        plane3.material.needsUpdate = true;
      });

    gui1.add(plane3, "renderOrder", 0, 10).step(1).name("渲染顺序");

    const gui2 = gui.addFolder("plane1");
    gui2
      .add(plane4.material, "depthFunc", {
        "THREE.NeverDepth": THREE.NeverDepth,
        "THREE.AlwaysDepth": THREE.AlwaysDepth,
        "THREE.LessDepth": THREE.LessDepth,
        "THREE.LessEqualDepth": THREE.LessEqualDepth,
        "THREE.GreaterEqualDepth": THREE.GreaterEqualDepth,
        "THREE.GreaterDepth": THREE.GreaterDepth,
        "THREE.NotEqualDepth": THREE.NotEqualDepth,
      })
      .name("深度模式");
    gui2
      .add(plane4.material, "depthWrite")
      .name("深度写入")
      .onChange(() => {
        plane4.material.needsUpdate = true;
      });
    gui2
      .add(plane4.material, "depthTest")
      .name("深度测试")
      .onChange(() => {
        plane4.material.needsUpdate = true;
      });

    gui2.add(plane4, "renderOrder", 0, 10).step(1).name("渲染顺序");
    // 创建平面
    let spriteTexture = new THREE.TextureLoader().load(
      "../../../texture/sprite0.png"
    );
    spriteTexture.colorSpace = THREE.SRGBColorSpace;
    const planeGeometry5 = new THREE.PlaneGeometry(10, 10),
      planeMaterial5 = new THREE.MeshBasicMaterial({
        map: spriteTexture,
        side: THREE.DoubleSide,
        transparent: true,
      }),
      plane5 = new THREE.Mesh(planeGeometry5, planeMaterial5);
    // plane.visible = false;
    plane5.renderOrder = 0;
    scene.add(plane5);
    plane5.position.set(20, 0, 0);
    // 设置深度模式
    plane5.material.depthFunc = THREE.LessEqualDepth;
    plane5.material.depthWrite = true;
    plane5.material.depthTest = true;

    let material = plane5.material;
    material.blending = THREE.CustomBlending;
    material.blendEquationAlpha = THREE.AddEquation;
    material.blendSrcAlpha = THREE.OneFactor;
    material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;

    // 设置混合方程式 最终颜色 = 源颜色 * 源因子 + 目标颜色 * 目标因子

    // gui
    gui
      .add(material, "blending", {
        NoBlending: THREE.NoBlending,
        NormalBlending: THREE.NormalBlending,
        AdditiveBlending: THREE.AdditiveBlending,
        SubtractiveBlending: THREE.SubtractiveBlending,
        MultiplyBlending: THREE.MultiplyBlending,
        CustomBlending: THREE.CustomBlending,
      })
      .name("blending");

    gui
      .add(material, "blendEquation", {
        AddEquation: THREE.AddEquation,
        SubtractEquation: THREE.SubtractEquation,
        ReverseSubtractEquation: THREE.ReverseSubtractEquation,
        MinEquation: THREE.MinEquation,
        MaxEquation: THREE.MaxEquation,
      })
      .name("blendEquation");

    gui
      .add(material, "blendSrc", {
        ZeroFactor: THREE.ZeroFactor,
        OneFactor: THREE.OneFactor,
        SrcColorFactor: THREE.SrcColorFactor,
        OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
        SrcAlphaFactor: THREE.SrcAlphaFactor,
        OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
        DstAlphaFactor: THREE.DstAlphaFactor,
        OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
        DstColorFactor: THREE.DstColorFactor,
        OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
        SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
      })
      .name("blendSrc");
    gui
      .add(material, "blendDst", {
        ZeroFactor: THREE.ZeroFactor,
        OneFactor: THREE.OneFactor,
        SrcColorFactor: THREE.SrcColorFactor,
        OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
        SrcAlphaFactor: THREE.SrcAlphaFactor,
        OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
        DstAlphaFactor: THREE.DstAlphaFactor,
        OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
        DstColorFactor: THREE.DstColorFactor,
        OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
        // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
      })
      .name("blendDst");

    gui
      .add(material, "blendEquationAlpha", {
        AddEquation: THREE.AddEquation,
        SubtractEquation: THREE.SubtractEquation,
        ReverseSubtractEquation: THREE.ReverseSubtractEquation,
        MinEquation: THREE.MinEquation,
        MaxEquation: THREE.MaxEquation,
      })
      .name("blendEquationAlpha");

    gui
      .add(material, "blendSrcAlpha", {
        ZeroFactor: THREE.ZeroFactor,
        OneFactor: THREE.OneFactor,
        SrcColorFactor: THREE.SrcColorFactor,
        OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
        SrcAlphaFactor: THREE.SrcAlphaFactor,
        OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
        DstAlphaFactor: THREE.DstAlphaFactor,
        OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
        DstColorFactor: THREE.DstColorFactor,
        OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
        SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
      })
      .name("blendSrcAlpha");
    gui.add(material, "blendDstAlpha", {
      ZeroFactor: THREE.ZeroFactor,
      OneFactor: THREE.OneFactor,
      SrcColorFactor: THREE.SrcColorFactor,
      OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
      SrcAlphaFactor: THREE.SrcAlphaFactor,
      OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
      DstAlphaFactor: THREE.DstAlphaFactor,
      OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
      DstColorFactor: THREE.DstColorFactor,
      OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
      // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
    });
    const // 创建裁剪平面
      plane6 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 100),
      // 创建第2个平面
      plane7 = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

    renderer.clippingPlanes = [plane6, plane7];
    const folder = gui.addFolder("裁剪平面");
    // 添加一个滑块
    folder.add(plane6, "constant", -100, 100).name("位置");
    // // 设置plane的normal属性
    folder.add(plane6.normal, "x", -1, 1).name("法向量x");
    folder.add(plane6.normal, "y", -1, 1).name("法向量y");
    folder.add(plane6.normal, "z", -1, 1).name("法向量z");
    const geometry12 = new THREE.TorusKnotGeometry(10, 3, 100, 16),
      material12 = new THREE.MeshPhysicalMaterial({
        // side: THREE.DoubleSide,
        side: THREE.FrontSide,
      }),
      torusKnot12 = new THREE.Mesh(geometry12, material12);
    scene.add(torusKnot12);
    torusKnot12.position.set(0, -10, 0);
    const material13 = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        color: 0xffcccc,
        stencilWrite: true,
        stencilRef: 1,
        stencilWriteMask: 0xff,
        stencilZPass: THREE.ReplaceStencilOp,
      }),
      torusKnot13 = new THREE.Mesh(geometry12, material13);
    torusKnot13.position.set(30, 0, 0);
    scene.add(torusKnot13);

    // 创建裁剪平面
    const plane12 = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    material12.clippingPlanes = [plane12];
    material13.clippingPlanes = [plane12];
    renderer.localClippingEnabled = true;
    // // 设置裁剪阴影

    // 创建一个gui
    const folder1 = gui.addFolder("裁剪平面");
    // 添加一个滑块
    folder1.add(plane12, "constant", -100, 100).name("位置1");
    // // 设置plane的normal属性
    folder1.add(plane12.normal, "x", -1, 1).name("法向量x1");
    folder1.add(plane12.normal, "y", -1, 1).name("法向量y1");
    folder1.add(plane12.normal, "z", -1, 1).name("法向量z1");

    // 创建平面
    let planeGeometry13 = new THREE.PlaneGeometry(40, 40, 1, 1),
      planeMaterial13 = new THREE.MeshPhysicalMaterial({
        color: 0xccccff,
        metalness: 0.95,
        roughness: 0.1,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.EqualStencilFunc,
      }),
      planeMesh13 = new THREE.Mesh(planeGeometry13, planeMaterial13);
    planeMesh13.rotation.x = -Math.PI / 2;
    scene.add(planeMesh13);
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
  scene.environment = null;
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
