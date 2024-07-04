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
// 导入connon引擎
import * as CANNON from "cannon-es";
const drawer = ref(false),
  requestRef = ref<number | null>(null),
  tipArr = ref([
    {
      description: `创建Cannon.js中的物理世界和地板<br>
    Cannon.js是一个物理引擎，我们用它来模拟真实世界中的物理效果。<br>
new CANNON.World()：创建一个新的物理世界。<br>
world.gravity.set(0, -9.8, 0)：设置世界的重力，类似于地球的重力。`,
      code: `const world = new CANNON.World()
world.gravity.set(0, -9.8, 0)`,
      height: "30px",
    },
    {
      description: `设置音效`,
      code: `const hitSound = new Audio('/assets/metalHit.mp3')`,
      height: "20px",
    },
    {
      description: `创建Cannon.js中的地板<br>
    new CANNON.Plane()：创建一个物理世界中的平面形状，代表地板。<br>
new CANNON.Body()：创建一个物理物体，这个物体将用于地板。<br>
new CANNON.Material('floor')：创建一个物理材质，称为“floor”。<br>
floorBody.material = floorMaterial：将材质赋予地板物体。<br>
floorBody.mass = 0：将地板物体的质量设为0，这意味着它是静止的，不会被重力影响。<br>
floorBody.addShape(floorShape)：将平面形状添加到地板物体中。<br>
floorBody.position.set(0, -5, 0)：将地板物体放置在y轴的-5位置上。<br>
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)：将地板物体旋转90度，使其平铺在地面上。<br>
world.addBody(floorBody)：将地板物体添加到物理世界中。`,
      code: `const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
const floorMaterial = new CANNON.Material('floor')
floorBody.material = floorMaterial
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.position.set(0, -5, 0)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(floorBody)`,
      height: "120px",
    },
    {
      description: `设置物理材质的碰撞参数<br>
    new CANNON.ContactMaterial(cubeWorldMaterial, floorMaterial, { friction: 0.1, restitution: 0.7 })：创建一个接触材质，定义两个材质之间的碰撞参数。<br>
friction: 0.1：摩擦力，值越小表示物体更滑。<br>
restitution: 0.7：弹性，值越大表示物体碰撞后反弹得越高。<br>
world.addContactMaterial(defaultContactMaterial)：将这个接触材质添加到物理世界中。<br>
world.defaultContactMaterial = defaultContactMaterial：设置默认的接触材质，如果没有特别设置的材质碰撞时就使用这个默认的。`,
      code: `const defaultContactMaterial = new CANNON.ContactMaterial(cubeWorldMaterial, floorMaterial, {
  friction: 0.1,
  restitution: 0.7
})
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial`,
      height: "80px",
    },
    {
      description: `更新物理世界,创建的物体同步物理世界的物体`,
      code: `   function nowanimate() {
      requestRef.current = requestAnimationFrame(nowanimate) // 更新 ref 的当前值
      //   let time = clock.getElapsedTime();
      let deltaTime = clock.getDelta()
      // 更新物理引擎里世界的物体
      world.step(1 / 120, deltaTime)

      //   cube.position.copy(cubeBody.position);
      cubeArr.forEach((item: any) => {
        item.mesh.position.copy(item.body.position)
        // 设置渲染的物体跟随物理的物体旋转
        item.mesh.quaternion.copy(item.body.quaternion)
      })
    }
    nowanimate()`,
      height: "180px",
    },
    {
      description: `创建两个世界里的物体,碰撞出声音`,
      code: `   function createCube() {
      // 创建立方体和平面
      const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
      const cubeMaterial = new THREE.MeshStandardMaterial()
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      cube.castShadow = true
      scene.add(cube)
      // 创建物理cube形状
      const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))

      // 创建物理世界的物体
      const cubeBody = new CANNON.Body({
        shape: cubeShape,
        position: new CANNON.Vec3(0, 0, 0),
        //   小球质量
        mass: 1,
        //   物体材质
        material: cubeWorldMaterial
      })
      cubeBody.applyLocalForce(
        new CANNON.Vec3(300, 0, 0), //添加的力的大小和方向
        new CANNON.Vec3(0, 0, 0) //施加的力所在的位置
      )

      // 将物体添加至物理世界
      world.addBody(cubeBody)
      // 添加监听碰撞事件
      function HitEvent(e: any) {
        // 获取碰撞的强度
        //   console.log("hit", e);
        const impactStrength = e.contact.getImpactVelocityAlongNormal()
        console.log(impactStrength)
        if (impactStrength > 2) {
          //   重新从零开始播放
          hitSound.currentTime = 0
          hitSound.volume = impactStrength / 12
          hitSound.play()
        }
      }
      cubeBody.addEventListener('collide', HitEvent)
      cubeArr.push({
        mesh: cube,
        body: cubeBody
      })
    }

    window.addEventListener('click', createCube)`,
      height: "20px",
    },
  ]),
  // const
  // 创建物理世界
  // const world = new CANNON.World({ gravity: 9.8 });
  world = new CANNON.World();
world.gravity.set(0, -9.8, 0);
const cubeArr: any = [];
let event = ref();
onMounted(() => {
  nextTick(() => {
    fncamera();
    rendererfn();
    animate();
    addControls();
    windowinit();
    //设置物体材质
    const cubeWorldMaterial = new CANNON.Material("cube"),
      floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial()
      );

    floor.position.set(0, -5, 0);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    // 创建击打声音
    const hitSound = new Audio("/assets/metalHit.mp3"),
      // 物理世界创建地面
      floorShape = new CANNON.Plane(),
      floorBody = new CANNON.Body(),
      floorMaterial = new CANNON.Material("floor");
    floorBody.material = floorMaterial;
    // 当质量为0的时候，可以使得物体保持不动
    floorBody.mass = 0;
    floorBody.addShape(floorShape);
    // 地面位置
    floorBody.position.set(0, -5, 0);
    // 旋转地面的位置
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
    world.addBody(floorBody);

    // 设置2种材质碰撞的参数
    const defaultContactMaterial = new CANNON.ContactMaterial(
      cubeWorldMaterial,
      floorMaterial,
      {
        //   摩擦力
        friction: 0.1,
        // 弹性
        restitution: 0.7,
      }
    );

    // 讲材料的关联设置添加的物理世界
    world.addContactMaterial(defaultContactMaterial);

    // 设置世界碰撞的默认材料，如果材料没有设置，都用这个
    world.defaultContactMaterial = defaultContactMaterial;

    //添加环境光和平行光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    // 设置时钟
    const clock = new THREE.Clock();
    function nowanimate() {
      requestRef.value = requestAnimationFrame(nowanimate); // 更新 ref 的当前值
      let deltaTime = clock.getDelta();
      // 更新物理引擎里世界的物体
      world.step(1 / 120, deltaTime);

      //   cube.position.copy(cubeBody.position);
      cubeArr.forEach((item: any) => {
        item.mesh.position.copy(item.body.position);
        // 设置渲染的物体跟随物理的物体旋转
        item.mesh.quaternion.copy(item.body.quaternion);
      });
    }
    nowanimate();
    event.value = function createCube() {
      // 创建立方体和平面
      const cubeGeometry = new THREE.BoxGeometry(1, 1, 1),
        cubeMaterial = new THREE.MeshStandardMaterial(),
        cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.castShadow = true;
      scene.add(cube);
      // 创建物理cube形状
      const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
        // 创建物理世界的物体
        cubeBody = new CANNON.Body({
          shape: cubeShape,
          position: new CANNON.Vec3(0, 0, 0),
          //   小球质量
          mass: 1,
          //   物体材质
          material: cubeWorldMaterial,
        });
      cubeBody.applyLocalForce(
        new CANNON.Vec3(300, 0, 0), //添加的力的大小和方向
        new CANNON.Vec3(0, 0, 0) //施加的力所在的位置
      );

      // 将物体添加至物理世界
      world.addBody(cubeBody);
      // 添加监听碰撞事件
      function HitEvent(e: any) {
        // 获取碰撞的强度
        //   console.log("hit", e);
        const impactStrength = e.contact.getImpactVelocityAlongNormal();
        console.log(impactStrength);
        if (impactStrength > 2) {
          //   重新从零开始播放
          hitSound.currentTime = 0;
          hitSound.volume = impactStrength / 12;
          hitSound.play();
        }
      }
      cubeBody.addEventListener("collide", HitEvent);
      cubeArr.push({
        mesh: cube,
        body: cubeBody,
      });
    };

    window.addEventListener("click", event.value);
  });
});
onBeforeUnmount(() => {
  if (requestRef.value !== null) {
    cancelAnimationFrame(requestRef.value);
  }
  // 遍历所有物体并将它们从物理世界中移除
  world.bodies.forEach((body) => {
    world.removeBody(body);
  });
  window.removeEventListener("click", event.value);
  // 清空物理世界的接触材质
  world.contactmaterials.length = 0;
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
