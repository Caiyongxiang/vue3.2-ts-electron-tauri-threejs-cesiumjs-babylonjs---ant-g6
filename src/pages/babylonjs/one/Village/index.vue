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
  Sound,
  StandardMaterial,
  Color3,
  Texture,
  Vector4,
  Mesh,
  SceneLoader,
} from "babylonjs";
import "babylonjs-loaders";
const drawer = ref(false),
  babylonword = ref(),
  editorInstances = ref<monaco.editor.IStandaloneCodeEditor[]>([]),
  tipArr = ref([
    {
      description: "创建地面",
      code: `MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);`,
      height: "100px",
    },
    {
      description: "创建音频",
      code: `new Sound(
      "cello",
      "https://playground.babylonjs.com/sounds/cellolong.wav",
      scene,
      null,
      { loop: true, autoplay: true }
    );`,
      height: "100px",
    },
    {
      description: "房顶",
      code: `const roof = MeshBuilder.CreateCylinder(
      "roof",
      {
        diameter: 1.3,
        height: 1.2,
        tessellation: 3,
      },
      scene
    );
    roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;`,
      height: "120px",
    },
    {
      description: "材质",
      code: `const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseColor = new Color3(0, 1, 0);
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    ); //地面
    ground.material = groundMat;
        const roofMat = new StandardMaterial("roofMat");
    roofMat.diffuseTexture = new Texture(
      "https://assets.babylonjs.com/environments/roof.jpg"
    );
    roof.material = roofMat;`,
      height: "200px",
    },
    {
      description:
        "纹理UV UV是为了确定贴图的位置,如果没有的话，默认所有面都加贴图全部,加了uv相当于每个面的贴图都有剪切的效果",
      code: `const faceUV = [
        new Vector4(0.5, 0.0, 0.75, 1.0),
        new Vector4(0.0, 0.0, 0.25, 1.0),
        new Vector4(0.25, 0, 0.5, 1.0),
        new Vector4(0.75, 0, 1.0, 1.0),
      ],
      box = MeshBuilder.CreateBox(
        "box",
        {
          faceUV,
          wrap: true,
          // width: 2,
          // height: 1.5,
          // depth: 3,
        },
        scene
      );`,
      height: "120px",
    },
    {
      description: "合并网格",
      code: `const house = Mesh.MergeMeshes(
      [box, roof],
      true,
      false,
      undefined,
      false,
      true
    );`,
      height: "120px",
    },
    {
      description: "克隆和导入glb",
      code: `for (let i = 0; i > -5; i = i - 2) {
      let house1 = house?.clone("house-" + (i - 0.5));
      house1!.position.x = i - 0.5;
      let housey = house?.clone("housey-" + (i - 0.5));
      housey!.position.z = i - 0.5;
      //需要babylonjs-loaders
       SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "village.glb"
    );
    }`,
      height: "120px",
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
    const faceUV = [
        new Vector4(0.5, 0.0, 0.75, 1.0),
        new Vector4(0.0, 0.0, 0.25, 1.0),
        new Vector4(0.25, 0, 0.5, 1.0),
        new Vector4(0.75, 0, 1.0, 1.0),
      ],
      box = MeshBuilder.CreateBox(
        "box",
        {
          faceUV,
          wrap: true,
          // width: 2,
          // height: 1.5,
          // depth: 3,
        },
        scene
      ); // 将盒子添加到场景中
    box.position.y = 0.5;
    //三角形
    const roof = MeshBuilder.CreateCylinder(
      "roof",
      {
        diameter: 1.3,
        height: 1.2,
        tessellation: 3,
      },
      scene
    );
    roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseColor = new Color3(0, 1, 0);
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    ); //地面
    ground.material = groundMat;
    const roofMat = new StandardMaterial("roofMat");
    roofMat.diffuseTexture = new Texture(
      "https://assets.babylonjs.com/environments/roof.jpg"
    );
    roof.material = roofMat;
    const boxMat = new StandardMaterial("boxMat");
    boxMat.diffuseTexture = new Texture(
      "https://assets.babylonjs.com/environments/cubehouse.png"
    );
    box.material = boxMat;
    // console.log(box.getVerticesData(VertexBuffer.UVKind));

    // new Sound(
    //   "cello",
    //   "https://playground.babylonjs.com/sounds/cellolong.wav",
    //   scene,
    //   null,
    //   { loop: true, autoplay: true }
    // );
    const bounce = new Sound(
      "bounce",
      "https://playground.babylonjs.com/sounds/bounce.wav",
      scene
    );
    bounce.play();
    const house = Mesh.MergeMeshes(
      [box, roof],
      true,
      false,
      undefined,
      false,
      true
    );
    console.log(house);
    // for (let i = 0; i < 5; i = i + 2) {
    //   let house1 = house?.createInstance("house" + (i + 0.5));
    //   house1!.position.x = i + 0.5;
    //   let housey = house?.createInstance("housey" + (i + 0.5));
    //   housey!.position.z = i + 0.5;
    // }
    // for (let i = 0; i > -5; i = i - 2) {
    //   let house1 = house?.clone("house-" + (i - 0.5));
    //   house1!.position.x = i - 0.5;
    //   let housey = house?.clone("housey-" + (i - 0.5));
    //   housey!.position.z = i - 0.5;
    // }
    // setTimeout(() => {
    //   bounce.play();
    // }, 3000);
    SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "village.glb"
    );
  });
});
onBeforeUnmount(() => {
  babylonword.value.dispose();
  editorInstances.value.forEach(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editor.dispose();
    }
  );
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
