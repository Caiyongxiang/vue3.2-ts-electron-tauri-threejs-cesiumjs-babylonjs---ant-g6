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
// 导入hdr加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 导入gltf加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 导入draco解码器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// 导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
const drawer = ref(false),
  requestRef = ref<number | null>(null),
  tipArr = ref([
    {
      description: `MeshMatcapMaterial是一种特殊的材质，它使用一种叫做"Matcap"的纹理（texture）来模拟光照和反射效果。它不依赖于场景中的实际光源，而是通过一个预先生成的纹理来决定模型的外观<br>Matcap（Material Capture）是一种纹理图像，通常是球形的，包含了特定光照条件下的材质效果。它捕捉了光源、阴影和反射的信息。你可以把它看作是一个带有特殊光照效果的“贴图`,
      language: "javascript",
      code: `    gltfLoader.load(
      // 模型路径
      '../../../model/Duck.glb',
      // 加载完成回调
      gltf => {
        console.log(gltf)
        scene.add(gltf.scene)

        let duckMesh = gltf.scene.getObjectByName('LOD3spShape') as any
        let matcapTexture = new THREE.TextureLoader().load('../../../texture/matcaps/54584E_B1BAC5_818B91_A7ACA3-512px.png')
        let preMaterial = duckMesh.material
        duckMesh.material = new THREE.MeshMatcapMaterial({
          matcadescription: matcapTexture,
          madescription: preMaterial.map
        })
      }
    )`,
      height: "230px",
      theme: "vs-dark",
    },
    {
      description: `MeshLambertMaterial、MeshPhongMaterial 和 MeshStandardMaterial 的区别<br>
MeshLambertMaterial：<br>
漫反射光照：适合模拟光线在表面均匀反射的效果。<br>
简单光照：适合不太复杂的场景。<br>
示例：假设你制作一个木质桌子，材质主要是木头，不需要太多的光泽和反射效果。使用 MeshLambertMaterial 可以简单地表现出木头的质感和颜色。<br>
MeshPhongMaterial：<br>
镜面反射光照：模拟光线在表面上形成高光点的效果。<br>
复杂光照：比 MeshLambertMaterial 更复杂，适合需要光泽和反射的场景。<br>
示例：假设你制作一个塑料表面的小汽车模型，需要表现出车身的光泽和反光效果。使用 MeshPhongMaterial 可以让车身看起来更有光泽和反射。<br>
MeshStandardMaterial：<br>
物理渲染：基于物理的渲染，更真实地模拟光线和材质的交互。<br>
高质量光照：适合需要高质量光照和反射的场景。
示例：假设你制作一个金属机器人模型，需要非常精细的光照和反射效果。使用 MeshStandardMaterial 可以实现非常真实的金属质感和光泽。<br>
假设你在设计一个三维的木质桌子模型：<br>
颜色贴图（madescription: colorTexture）：<br>

你给桌子表面贴上了一张木纹图片，使桌子看起来像是由木材制成的。<br>
高光贴图（specularMadescription: specularTexture）：<br>

你希望桌子的某些部分（比如桌角）显得更有光泽，所以你给这些部分增加了高光贴图。<br>
透明效果（transparent: true）：<br>

你希望桌子有一层玻璃涂层，可以看到桌子内部的一些细节，所以设置材质透明。<br>
法线贴图（normalMadescription: normalTexture）：<br>

你希望桌子表面看起来更加立体和真实，于是你给表面增加了一些微小的纹理细节，这些纹理在光照下显得更真实。<br>
凹凸贴图（bumpMadescription: dispTexture）：<br>

你想模拟桌子表面的细小高低不平，所以用凹凸贴图增强这种效果。<br>
位移贴图（displacementMadescription: dispTexture）：<br>

你希望桌子表面有明显的凹凸不平效果，不只是视觉上的，所以使用位移贴图来改变桌子的几何形状。<br>
位移缩放（displacementScale: 0.02）：<br>

你控制位移效果的强度，使桌子的凹凸效果看起来自然不过度。<br>
环境光遮蔽贴图（aoMadescription: aoTexture）：<br>

你希望桌子的阴影效果更真实，比如桌子腿和桌面交接处的阴影，于是你使用环境光遮蔽贴图来增强这些细节。<br>
解释：折射率（refractionRatio）决定了光线穿过物体时发生的弯曲程度。折射率值越高，光线弯曲得越厉害。这常用于模拟透明材质，比如玻璃、水等。<br>
举例：想象你在设计一个玻璃球。如果设置 refractionRatio: 0.7，光线通过玻璃球时会发生一定程度的弯曲，使得看透玻璃球看到的物体会有一些变形。这种效果可以让玻璃球看起来更真实。<br>
解释：反射率（reflectivity）决定了物体表面对光线的反射程度。反射率值越高，物体表面越能像镜子一样反射周围环境。<br>
举例：想象你在设计一个金属镜子。如果设置 reflectivity: 0.99，镜子表面几乎能完全反射周围环境，就像真正的镜子一样。这个设置可以让镜子表面看起来非常光亮和真实。`,
      language: "javascript",
      code: `
// 创建平面
    let planeGeometry = new THREE.PlaneGeometry(1, 1, 200, 200)
    // 添加纹理
    let textureLoader = new THREE.TextureLoader()
    let colorTexture = textureLoader.load('../../../texture/watercover/CityNewYork002_COL_VAR1_1K.png')
    colorTexture.colorSpace = THREE.SRGBColorSpace
    // 高光贴图
    let specularTexture = textureLoader.load('../../../texture/watercover/CityNewYork002_GLOSS_1K.jpg')
    // 法线贴图
    let normalTexture = textureLoader.load('../../../texture/watercover/CityNewYork002_NRM_1K.jpg')
    // 凹凸贴图
    let dispTexture = textureLoader.load('../../../texture/watercover/CityNewYork002_DISP_1K.jpg')
    // 环境光遮蔽贴图
    let aoTexture = textureLoader.load('../../../texture/watercover/CityNewYork002_AO_1K.jpg')
    let planeMaterial = new THREE.MeshLambertMaterial({
      madescription: colorTexture,
      specularMadescription: specularTexture,
      transparent: true,
      normalMadescription: normalTexture,
      bumpMadescription: dispTexture,
      displacementMadescription: dispTexture,
      displacementScale: 0.02,
      aoMadescription: aoTexture
    })
    let plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)`,
      height: "230px",
      theme: "vs-dark",
    },
    {
      description: `材质更新`,
      language: "javascript",
      code: `mesh.material.needsUpdate = true`,
      height: "30px",
      theme: "vs-dark",
    },
    {
      description: `MeshPhysicalMaterial 是 Three.js 中一种用于创建具有物理属性的材质<br>
    Three.js 的标准材质（如 MeshStandardMaterial 和 MeshPhysicalMaterial）需要光源才能显示其效果<br>
MeshStandardMaterial 和 MeshPhysicalMaterial 都是 Three.js 中常用的材质类型，它们都能实现基于物理的渲染（PBR），但 MeshPhysicalMaterial 提供了更多的物理特性控制，使得渲染效果更加逼真。<br>
MeshStandardMaterial<br>
基本功能：用于创建基于物理的材质，能模拟大多数常见的材料效果。<br>
适用场景：适用于一般需求的三维模型材质，比如塑料、木材、普通金属等。<br>
主要属性：<br>
color: 设置材质颜色。<br>
roughness: 控制表面粗糙度，值越高表面越粗糙。<br>
metalness: 控制金属感，值越高看起来越像金属。<br>
madescription: 设置颜色贴图。<br>
MeshPhysicalMaterial<br>
高级功能：在 MeshStandardMaterial 的基础上，增加了更多的物理特性参数，可以模拟更加复杂和真实的材料效果。<br>
适用场景：适用于需要高度真实感的材质，比如高级玻璃、液体、复杂金属等。<br>
额外属性：<br>
transparency: 控制透明度。<br>
transmission: 控制透光性（光线通过物体的能力）。<br>
thickness: 设置材质厚度，影响光线在材质内部传播。<br>
attenuationColor: 设置光线通过材质时的衰减颜色。<br>
attenuationDistance: 设置光线在材质内部传播的距离。<br>
clearcoat: 增加一层透明涂层，可以用来模拟汽车漆等效果。<br>
clearcoatRoughness: 控制透明涂层的粗糙度。<br>
举例说明<br>
假设你在设计一个三维场景，包括一个透明玻璃球和一个金属表面：<br>
透明玻璃球<br>
transparent: true 使玻璃球变得透明。<br>
transmission: 0.95 使光线几乎完全穿透玻璃球。<br>
roughness: 0.05 使玻璃表面非常光滑。<br>
thickness: 2 模拟玻璃球的厚度。<br>
attenuationColor: new THREE.Color(0.9, 0.9, 0) 给光线通过玻璃球时带上一点黄色。<br>
attenuationDistance: 1 使光线在玻璃球内部传播时快速衰减。<br>
金属表面

roughness: 0.1 使金属表面看起来光滑但不完全镜面。
reflectivity: 0.99 使金属表面反射环境光，看起来非常真实。
    `,
      language: "javascript",
      code: `  // 创建材质
    const material = new THREE.MeshPhysicalMaterial({
      transparent: true,
      transmission: 0.95,
      roughness: 0.05,
      thickness: 2,
      attenuationColor: new THREE.Color(0.9, 0.9, 0),
      attenuationDistance: 1,
      thicknessMadescription: thicknessMap
    })`,
      height: "300px",
      theme: "vs-dark",
    },
    {
      description: `refractionRatio：你在设计一个简单的玻璃窗，使用 refractionRatio 可以快速实现光线的基本折射效果。<br>
ior：你在设计一个精致的水晶吊灯，需要精确模拟光线在水晶中的折射和反射效果，使用 ior 更加合适<br>
    `,
      language: "javascript",
      code: `   gui.add(cube.material, 'ior', 0, 2).name('折射率')
  // reflectivity
  gui.add(cube.material, 'reflectivity', 0, 1).name('反射率')`,
      height: "30px",
      theme: "vs-dark",
    },
    {
      description: `clearcoatRoughness
定义：控制材质上透明涂层（清漆）的粗糙度。<br>
作用：值越小，涂层越光滑，反射越清晰；值越大，涂层越粗糙，反射越模糊。<br>
举例：你在设计一辆跑车的漆面，漆面非常光滑闪亮，你可以设置 clearcoatRoughness: 0，这样漆面的反射会非常清晰。<br>
clearcoatMap
定义：使用贴图控制清漆的强度。<br>
作用：不同部分的清漆强度可以不同，创造不均匀的清漆效果。<br>
举例：你在设计一个旧的金属箱子，一些地方的清漆已经磨损，可以使用 clearcoatMap 来表现这些磨损的区域，使它们看起来没有清漆的光泽。<br>
clearcoatRoughnessMap
定义：使用贴图控制清漆粗糙度。<br>
作用：不同部分的清漆粗糙度可以不同，创造不均匀的反射效果。<br>
举例：你在设计一个木制家具，有些地方因为使用频繁而变得光滑，可以使用 clearcoatRoughnessMap 来表现这些地方的清漆变得光滑，而其他地方保持原来的粗糙度。<br>
clearcoatNormalMap
定义：使用法线贴图控制清漆层的细节。<br>
作用：模拟清漆表面细小的凹凸和纹理，使表面更真实。<br>
举例：你在设计一款钢琴，钢琴表面有细小的划痕，你可以使用 clearcoatNormalMadescription: scratchNormal 来添加这些细小的划痕，使表面看起来更真实。<br>
normalMap
定义：使用法线贴图控制材质本身的细节。<br>
作用：模拟材质表面的凹凸和纹理，使表面更逼真。<br>
举例：你在设计一块碳纤维面板，面板表面有特有的纹理，你可以使用 normalMadescription: carbonNormal 来添加这些碳纤维纹理，使面板看起来更加逼真。<br>
clearcoatNormalScale
定义：控制清漆层法线贴图的缩放比例。<br>
作用：调整清漆层表面细节的强度和大小。<br>
举例：你在设计一个汽车模型，想让车漆上的细小划痕不那么明显，可以使用 clearcoatNormalScale: new THREE.Vector2(0.1, 0.1) 来减弱划痕的强度，使划痕看起来更加微小和不明显。
    `,
      language: "javascript",
      code: `
    //你在设计一辆跑车，并希望车漆看起来非常光滑且具有真实的细小划痕：
    const material = new THREE.MeshPhysicalMaterial({
  color: 0xff0000, // 车身颜色为红色
  clearcoat: 1, // 高强度的清漆层
  clearcoatRoughness: 0, // 清漆层非常光滑
  clearcoatNormalMadescription: scratchNormal, // 使用划痕法线贴图
  normalMadescription: carbonNormal, // 使用碳纤维法线贴图
  clearcoatNormalScale: new THREE.Vector2(0.1, 0.1) // 划痕的强度较低，划痕较小
});`,
      height: "100px",
      theme: "vs-dark",
    },
    {
      description: `sheen
定义：控制材质的光泽度，类似于丝绸或天鹅绒的光泽。<br>
作用：值越大，光泽效果越明显。<br>
举例：你在设计一件丝绸的礼服，想要让它有柔和的光泽感，可以设置 sheen: 1。<br>
sheenColor
定义：控制光泽的颜色。<br>
作用：可以为光泽效果添加颜色。<br>
举例：你在设计一张红色天鹅绒沙发，想要沙发的光泽也呈现红色，可以设置 sheenColor: 0xff0000。<br>
roughness
定义：控制材质的整体粗糙度。<br>
作用：值越小，材质越光滑，反射越清晰；值越大，材质越粗糙，反射越模糊。<br>
举例：你在设计一个哑光的金属表面，想要它的反射非常模糊，可以设置 roughness: 1。<br>
sheenRoughness
定义：控制光泽效果的粗糙度。<br>
作用：值越小，光泽效果越光滑；值越大，光泽效果越模糊。<br>
举例：你在设计一件天鹅绒外套，想要光泽效果更加柔和，可以设置 sheenRoughness: 1。<br>
sheenColorMap
定义：使用贴图控制光泽效果的颜色。<br>
作用：不同部分的光泽颜色可以不同，创造不均匀的光泽效果。<br>
举例：你在设计一个砖墙，想要砖墙表面的光泽效果有不同颜色，可以使用 sheenColorMadescription: brickRoughness，使光泽颜色随贴图变化。
    `,
      language: "javascript",
      code: `
    //你在设计一张白色的丝绸枕头，并希望它有柔和的光泽：
    const material = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, // 枕头颜色为白色
  sheen: 1, // 高光泽度
  sheenColor: 0xffffff, // 光泽颜色为白色
  roughness: 0.5, // 中等粗糙度
  sheenRoughness: 0.5, // 中等光泽粗糙度
  sheenColorMadescription: silkTexture // 使用丝绸纹理贴图
});`,
      height: "100px",
      theme: "vs-dark",
    },
    {
      description: `roughness
定义：控制材质表面的粗糙度。<br>
作用：值越小，材质越光滑，反射越清晰；值越大，材质越粗糙，反射越模糊。<br>
举例：你在设计一款高光泽的陶瓷花瓶，想让它表面非常光滑，可以设置 roughness: 0.05。<br>
transmission
定义：控制材质的透明度。<br>
作用：值越大，材质越透明。<br>
举例：你在设计一个玻璃杯，想要它完全透明，可以设置 transmission: 1。<br>
thickness
定义：控制透明材质的厚度。<br>
作用：影响光线穿过材质时的折射效果。<br>
举例：你在设计一个水晶球，想要它有一定的厚度来产生折射效果，可以设置 thickness: 0.1。<br>
iridescence
定义：控制材质的虹彩效果，即不同角度看上去有不同颜色的效果。<br>
作用：值越大，虹彩效果越明显。<br>
举例：你在设计一只珍珠，想要它在不同角度看上去呈现不同的颜色，可以设置 iridescence: 1。<br>
reflectivity
定义：控制材质的反射率。<br>
作用：值越大，反射效果越明显。<br>
举例：你在设计一个镜面，想要它有强烈的反射效果，可以设置 reflectivity: 1。<br>
iridescenceIOR
定义：控制虹彩效果的折射率。<br>
作用：影响虹彩的强度和颜色变化。<br>
举例：你在设计一块有虹彩效果的玻璃，想要调节虹彩的强度和颜色变化，可以设置 iridescenceIOR: 1.3。<br>
iridescenceThicknessRange
定义：控制虹彩效果的厚度范围。<br>
作用：范围内的厚度变化会影响虹彩效果的颜色。<br>
举例：你在设计一个贝壳，想要它在不同角度显示不同的颜色，可以设置 iridescenceThicknessRange: [100, 400]。<br>
iridescenceThicknessMap
定义：使用贴图控制虹彩效果的厚度。<br>
作用：不同部分的虹彩厚度可以不同，创造不均匀的虹彩效果。<br>
举例：你在设计一个虹彩效果的表面，想要不同部分显示不同的颜色，可以使用 iridescenceThicknessMadescription: brickRoughness。
    `,
      language: "javascript",
      code: `
    //你在设计一只水晶球，并希望它具有透明、光滑、虹彩和一定的厚度效果：
   const material = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, // 水晶球颜色为白色
  roughness: 0.05, // 表面非常光滑
  transmission: 1, // 完全透明
  thickness: 0.1, // 有一定的厚度
  iridescence: 1, // 强烈的虹彩效果
  reflectivity: 1, // 强烈的反射效果
  iridescenceIOR: 1.3, // 虹彩折射率
  iridescenceThicknessRange: [100, 400], // 虹彩厚度范围
  iridescenceThicknessMadescription: brickRoughness // 使用贴图控制虹彩厚度
});
`,
      height: "100px",
      theme: "vs-dark",
    },
    {
      description: `加载json
        `,
      language: "javascript",
      code: `
        const loader = new THREE.ObjectLoader()
    loader.load('../../../model/damon/scene.json', object => {
      scene.add(object)
    })
    `,
      height: "100px",
      theme: "vs-dark",
    },
    {
      description: `控制器权限控制
    `,
      language: "javascript",
      code: `let controls = addControls()
    // 设置带阻尼的惯性
    controls.enableDamping = true
    // 设置阻尼系数
    controls.dampingFactor = 0.05
    // 设置旋转速度
    // controls.autoRotate = true;
    controls.target.set(0, 1.2, 0)
    // 禁用平移
    controls.enablePan = false
    // 设置最小距离
    controls.minDistance = 3
    // 设置最大距离
    controls.maxDistance = 50
    // 设置垂直的最小角度
    controls.minPolarAngle = Math.PI / 2 - Math.PI / 12
    // 设置垂直的最大角度
    controls.maxPolarAngle = Math.PI / 2

    // 设置水平的最小角度
    controls.minAzimuthAngle = Math.PI / 2 - Math.PI / 12
    // 设置水平的最大角度
    controls.maxAzimuthAngle = Math.PI / 2 + Math.PI / 12
`,
      height: "100px",
    },

    {
      description: `销毁场景
    `,
      language: "javascript",
      code: `
  // 清除场景中的物体
  scene.remove(sphere);

  // // 清除几何体
  sphereGeometry.dispose();
  // // 清除材质
  sphereMaterial.dispose();
  // // 清除纹理贴图
  texture.dispose();
`,
      height: "100px",
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
    addControls();
    let controls = addControls();
    // 设置带阻尼的惯性
    controls.enableDamping = true;
    // 设置阻尼系数
    controls.dampingFactor = 0.05;
    // 设置旋转速度
    // controls.autoRotate = true;
    controls.target.set(0, 1.2, 0);
    // 禁用平移
    controls.enablePan = false;
    // 设置最小距离
    controls.minDistance = 3;
    // 设置最大距离
    controls.maxDistance = 50;
    // 设置垂直的最小角度
    controls.minPolarAngle = Math.PI / 2 - Math.PI / 12;
    // 设置垂直的最大角度
    controls.maxPolarAngle = Math.PI / 2;

    // 设置水平的最小角度
    controls.minAzimuthAngle = Math.PI / 2 - Math.PI / 12;
    // 设置水平的最大角度
    controls.maxAzimuthAngle = Math.PI / 2 + Math.PI / 12;
    // 实例化加载器gltf
    const gltfLoader = new GLTFLoader();
    // 加载模型
    // gltfLoader.load(
    //   // 模型路径
    //   '../../../model/Duck.glb',
    //   // 加载完成回调
    //   gltf => {
    //     console.log(gltf)
    //     scene.add(gltf.scene)

    //     let duckMesh = gltf.scene.getObjectByName('LOD3spShape') as any
    //     let matcapTexture = new THREE.TextureLoader().load('../../../texture/matcaps/54584E_B1BAC5_818B91_A7ACA3-512px.png')
    //     let preMaterial = duckMesh.material
    //     duckMesh.material = new THREE.MeshMatcapMaterial({
    //       matcap: matcapTexture,
    //       map: preMaterial.map
    //     })
    //   }
    // )
    // 环境光
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // 点光源
    let pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);
    // 创建平面
    let planeGeometry = new THREE.PlaneGeometry(1, 1, 200, 200),
      // 添加纹理
      textureLoader = new THREE.TextureLoader(),
      colorTexture = textureLoader.load(
        "../../../texture/watercover/CityNewYork002_COL_VAR1_1K.png"
      );
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    // 高光贴图
    let specularTexture = textureLoader.load(
        "../../../texture/watercover/CityNewYork002_GLOSS_1K.jpg"
      ),
      // 法线贴图
      normalTexture = textureLoader.load(
        "../../../texture/watercover/CityNewYork002_NRM_1K.jpg"
      ),
      // 凹凸贴图
      dispTexture = textureLoader.load(
        "../../../texture/watercover/CityNewYork002_DISP_1K.jpg"
      ),
      // 环境光遮蔽贴图
      aoTexture = textureLoader.load(
        "../../../texture/watercover/CityNewYork002_AO_1K.jpg"
      ),
      planeMaterial = new THREE.MeshLambertMaterial({
        map: colorTexture,
        specularMap: specularTexture,
        transparent: true,
        normalMap: normalTexture,
        bumpMap: dispTexture,
        displacementMap: dispTexture,
        displacementScale: 0.02,
        aoMap: aoTexture,
      }),
      plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    // rgbeLoader 加载hdr贴图
    let rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      "../../../texture/Alex_Hart-Nature_Lab_Bones_2k.hdr",
      (envMap) => {
        // 设置球形贴图
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        // 设置环境贴图
        scene.background = envMap;
        // 设置环境贴图
        scene.environment = envMap;

        planeMaterial.envMap = envMap;

        // 加载模型
        gltfLoader.load(
          // 模型路径
          "../../../model/Duck.glb",
          // 加载完成回调
          (gltf) => {
            console.log(gltf);
            scene.add(gltf.scene);
            let duckMesh = gltf.scene.getObjectByName("LOD3spShape") as any,
              preMaterial = duckMesh.material;
            duckMesh.material = new THREE.MeshPhongMaterial({
              // color: 0xffffff,
              map: preMaterial.map,
              refractionRatio: 0.7,
              reflectivity: 0.99,
              envMap: envMap,
            });
          }
        );
      }
    );
    function nowanimate() {
      requestRef.value = requestAnimationFrame(nowanimate); // 更新 ref 的当前值
    }
    nowanimate();

    let params = {
      aoMap: true,
    };
    // 实例化加载器draco
    const dracoLoader = new DRACOLoader();
    // 设置draco路径
    dracoLoader.setDecoderPath("../../draco/");
    // 设置gltf加载器draco解码器
    gltfLoader.setDRACOLoader(dracoLoader);
    // 加载模型
    gltfLoader.load(
      // 模型路径
      "../../../model/sword/sword.gltf",
      // 加载完成回调
      (gltf) => {
        console.log(gltf);
        gltf.scene.position.set(0, -1, 0);
        scene.add(gltf.scene);
        let mesh = gltf.scene.getObjectByName("Pommeau_Plane001") as any;
        console.log(mesh.material);
        let aoMap = mesh.material.aoMap;
        gui.add(params, "aoMap").onChange((value) => {
          mesh.material.aoMap = value ? aoMap : null;
          mesh.material.needsUpdate = true;
        });
      }
    );

    let thicknessMap = new THREE.TextureLoader().load(
      "../../../texture/diamond/diamond_emissive.png"
    );
    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1),
      // 创建材质
      material = new THREE.MeshPhysicalMaterial({
        transparent: true,
        transmission: 0.95,
        roughness: 0.05,
        thickness: 2,
        attenuationColor: new THREE.Color(0.9, 0.9, 0),
        attenuationDistance: 1,
        thicknessMap: thicknessMap,
      }),
      // 创建立方体网格模型
      cube = new THREE.Mesh(geometry, material);
    cube.position.set(2, 0, 0);
    // 添加立方体到场景
    scene.add(cube);

    gui.add(cube.material, "attenuationDistance", 0, 10).name("衰减距离");
    gui.add(cube.material, "thickness", 0, 2).name("厚度");
    gui.add(cube.material, "ior", 0, 2).name("折射率");
    // reflectivity
    gui.add(cube.material, "reflectivity", 0, 1).name("反射率");
    let brickRoughness = new THREE.TextureLoader().load(
      "../../../texture/brick/brick_roughness.jpg"
    );
    // 创建球几何体
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32),
      // 创建球材质
      sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x222288,
        sheen: 1,
        sheenColor: 0xffffff,
        roughness: 1,
        sheenRoughness: 1,
        sheenColorMap: brickRoughness,
      }),
      // 创建球体
      sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 2, 0);
    scene.add(sphere);
    // 创建球几何体
    const sphereGeometry1 = new THREE.SphereGeometry(1, 32, 32),
      // 创建球材质
      sphereMaterial1 = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.05,
        transmission: 1,
        thickness: 0.1,
        iridescence: 1,
        reflectivity: 1,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        iridescenceThicknessMap: brickRoughness,
      }),
      // 创建球体
      sphere1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
    scene.add(sphere1);
    sphere1.position.set(2, 2, 0);
    console.log(sphereMaterial);

    // gui 控制iridescence
    gui.add(sphereMaterial1, "iridescence", 0, 1).name("彩虹色");
    // gui 控制reflectivity
    gui.add(sphereMaterial1, "reflectivity", 0, 1).name("反射率");
    // gui 控制iridescenceIOR
    gui.add(sphereMaterial1, "iridescenceIOR", 0, 3).name("彩虹色折射率");
    // gui 控制iridescenceThicknessRange

    let iridescenceThickness = {
      min: 100,
      max: 400,
    };
    gui
      .add(iridescenceThickness, "min", 0, 1000)
      .name("彩虹色最小厚度")
      .onChange(() => {
        sphereMaterial1.iridescenceThicknessRange[0] = iridescenceThickness.min;
      });
    gui
      .add(iridescenceThickness, "max", 0, 1000)
      .name("彩虹色最大厚度")
      .onChange(() => {
        sphereMaterial1.iridescenceThicknessRange[1] = iridescenceThickness.max;
      });
    const loader = new THREE.ObjectLoader();
    loader.load("../../../model/damon/scene.json", (object) => {
      object.position.set(-3, 1, 0);
      scene.add(object);
    });

    // 加载模型
    gltfLoader.load(
      // 模型路径
      "../../../model/mobile/scene.glb",
      // 加载完成回调
      (gltf) => {
        console.log(gltf);
        gltf.scene.position.set(-6, 1, 0);
        scene.add(gltf.scene);
      }
    );

    // 加载模型
    gltfLoader.load(
      // 模型路径
      "../../../model/liveroom-scene.glb",
      // 加载完成回调
      (gltf) => {
        scene.add(gltf.scene);
      }
    );
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
  // 设置环境贴图
  scene.background = null;
  // 设置环境贴图
  scene.environment = null;
  scene.clear();
  scene.traverse(function (obj) {
    scene.remove(obj);
  });
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
