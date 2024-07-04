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
      description: `动画混合器<br>
    动画混合器是什么，通俗易懂的举例说明：<br>

动画混合器就像一个乐团的指挥，它负责协调和控制不同的乐器（动画）一起演奏（播放）。举个例子：<br>

想象你有一个玩具机器人，它可以做不同的动作，比如挥手、走路和跳舞。动画混合器就是一个控制面板，你可以通过它来告诉机器人什么时候开始挥手，什么时候开始走路，甚至可以让机器人同时做这些动作，并且控制这些动作的速度和力度。<br>

为什么要提取动画，walkAction = gltf.animations[37]这样不行吗？<br>

提取动画是为了让它更好地与动画混合器配合工作，并进行细粒度的控制。举个例子：<br>

假设你有一部手机应用，它内置了很多动画，比如滑动、点击、旋转等。如果你直接用gltf.animations[37]这样的方法，很难在不同动画之间切换，无法控制动画的速度、力度和是否启用等。而通过动画混合器，你可以轻松地调整这些参数。<br>

通俗易懂的举例说明 walkAction.enabled = true 等代码：<br>

walkAction.enabled = true:<br>
想象你有一个遥控玩具车，这行代码相当于把车子的电源打开，使它准备好运行。<br>

walkAction.setEffectiveTimeScale(1):<br>
这就像是设置玩具车的速度为正常速度。如果设置为2，车子会跑得更快；如果设置为0.5，车子会跑得更慢。<br>

walkAction.setEffectiveWeight(1):<br>
这就像是控制音响的音量。1代表声音开到最大，0代表静音。在动画中，权重控制动画的影响程度。<br>

currentAction.crossFadeTo(walkAction, 0.5, true):<br>
想象你正在看一部电影，现在你想切换到另一部电影。这个操作就像是把当前播放的电影逐渐变暗，同时让新电影逐渐变亮，过渡时间是0.5秒，让切换更加平滑自然，而不是突然切换。`,
      code: ` let delta = clock.getDelta()
      if (mixer) {
        mixer.update(delta)
      }
    // 创建GUI
    const gui = new GUI()
    // 加载模型
    gltfLoader.load(
      // 模型路径
      '../../../model/hilda_regular_00.glb',
      // 加载完成回调
      gltf => {
        scene.add(gltf.scene)
        mixer = new THREE.AnimationMixer(gltf.scene)
        walkAction = mixer.clipAction(gltf.animations[37])
        runAction = mixer.clipAction(gltf.animations[27])
        idleAction = mixer.clipAction(gltf.animations[6])
        posAction = mixer.clipAction(gltf.animations[23])
        greetAction = mixer.clipAction(gltf.animations[0])
        currentAction = idleAction
        idleAction.play()
        gui.add(mixer, 'timeScale')
        console.log(mixer)
        console.log(gltf)
      }
    )
    let eventObj = {
      stopAll: () => {
        mixer.stopAllAction()
      },
      play: () => {
        console.log(mixer)
        mixer._actions.forEach((action: any) => {
          action.play()
        })
      },
      playRun: () => {
        runAction.enabled = true
        runAction.setEffectiveTimeScale(1)
        runAction.setEffectiveWeight(1)
        runAction.play()
        currentAction.crossFadeTo(runAction, 0.5, true)
        currentAction = runAction
      },
      playWalk: () => {
        walkAction.enabled = true
        walkAction.setEffectiveTimeScale(1)
        walkAction.setEffectiveWeight(1)
        walkAction.play()
        currentAction.crossFadeTo(walkAction, 0.5, true)
        currentAction = walkAction
      },
      playGreet: () => {
        greetAction.enabled = true
        greetAction.setEffectiveTimeScale(1)
        greetAction.setEffectiveWeight(1)
        greetAction.play()
        currentAction.crossFadeTo(greetAction, 0.5, true)
        currentAction = greetAction
      },
      playIdle: () => {
        idleAction.enabled = true
        idleAction.setEffectiveTimeScale(1)
        idleAction.setEffectiveWeight(1)
        idleAction.play()
        currentAction.crossFadeTo(idleAction, 0.5, true)
        currentAction = idleAction
      },
      playPos: () => {
        posAction.enabled = true
        posAction.setEffectiveTimeScale(1)
        posAction.setEffectiveWeight(1)
        posAction.play()
        currentAction.crossFadeTo(posAction, 0.5, true)
        currentAction = posAction
      }
    }

    gui.add(eventObj, 'stopAll')
    gui.add(eventObj, 'play')
    gui.add(eventObj, 'playRun')
    gui.add(eventObj, 'playWalk')
    gui.add(eventObj, 'playGreet')
    gui.add(eventObj, 'playIdle')
    gui.add(eventObj, 'playPos')`,
      height: "430px",
    },
    {
      description: `创建立方体：<br>
你手里有一个彩色的小方块，你把它放在桌子上。<br>
创建位移动画：<br>

你决定让这个小方块沿着桌面移动，在0秒、1秒、2秒、3秒和4秒时分别到达不同的位置。<br>
创建四元数：<br>

你还想让小方块在移动的过程中旋转。你定义了三个时间点（0秒、2秒和4秒）小方块的旋转状态。<br>
比如，开始时小方块没有旋转（0秒），在2秒时小方块翻转180度（翻转过来），在4秒时又回到原来的状态。<br>
创建布尔关键帧：<br>

你还想让小方块在移动的过程中有时可见，有时隐藏。你定义了5个时间点（0秒、1秒、2秒、3秒和4秒）小方块的可见性状态。<br>
比如，开始时小方块是可见的（0秒），在1秒时小方块隐藏（消失），在2秒时又出现，在3秒时再次隐藏，在4秒时又出现。<br>
创建颜色关键帧：<br>

你还想让小方块在移动的过程中变色。你定义了3个时间点（0秒、2秒和4秒）小方块的颜色状态。<br>
比如，开始时小方块是粉色（0秒），在2秒时变成黄色，在4秒时又变回粉色。<br>
创建动画混合器、动画剪辑和动画动作：<br>

你有一个控制面板，用于控制小方块的移动、旋转、可见性和颜色。<br>
你把所有的指令组合成一个动画片段，并通过控制面板播放这个动画，让小方块按照预定的路径移动、旋转、变色和隐藏/出现。`,
      code: `// 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: 0xff33ff
    })
    const cube = new THREE.Mesh(geometry, material)
    cube.name = 'cube'
    scene.add(cube)

    // 创建位移动画
    const positionKF = new THREE.VectorKeyframeTrack(
      'cube.position',
      [0, 1, 2, 3, 4],
      [0, 0, 0, 2, 0, 0, 4, 0, 0, 2, 0, 0, 0, 0, 0]
    )
    const quaternion1 = new THREE.Quaternion()
    // quaternion1.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
    quaternion1.setFromEuler(new THREE.Euler(0, 0, 0))
    const quaternion2 = new THREE.Quaternion()
    // quaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    quaternion2.setFromEuler(new THREE.Euler(Math.PI, 0, 0))
    const quaternion3 = new THREE.Quaternion()
    // quaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
    quaternion3.setFromEuler(new THREE.Euler(0, 0, 0))
    console.log(quaternion1, quaternion2, quaternion3)
    const finQ = quaternion1.toArray().concat(quaternion2.toArray()).concat(quaternion3.toArray())
    console.log(finQ)

    // //  创建旋转动画帧
    const rotationKF = new THREE.QuaternionKeyframeTrack('cube.quaternion', [0, 2, 4], finQ)

    //布尔关键帧
    const boolKF = new THREE.BooleanKeyframeTrack('cube.visible', [0, 1, 2, 3, 4], [true, false, true, false, true])

    //颜色关键帧
    const colorKF = new THREE.ColorKeyframeTrack('cube.material.color', [0, 2, 4], [1, 0, 1, 1, 1, 0, 1, 0, 1])
    mixer2 = new THREE.AnimationMixer(cube)
    // 创建动画剪辑
    const clip = new THREE.AnimationClip('move', 4, [positionKF, rotationKF, colorKF, boolKF])
    // 创建动画动作
    const action = mixer2.clipAction(clip)
    action.play()`,
      height: "330px",
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
    windowinit();
    let mixer: any,
      mixer1: any,
      mixer2: any,
      clock = new THREE.Clock();
    function nowanimate() {
      requestRef.value = requestAnimationFrame(nowanimate); // 更新 ref 的当前值
      let delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }
      if (mixer1) {
        mixer1.update(delta);
      }
      if (mixer2) {
        mixer2.update(delta);
      }
    }
    nowanimate();
    // rgbeLoader 加载hdr贴图
    let rgbeLoader = new RGBELoader();
    rgbeLoader.load(
      "../../../texture/Alex_Hart-Nature_Lab_Bones_2k.hdr",
      (envMap) => {
        if (window.location.pathname !== "/viewDemo/one/animation") {
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
    let walkAction: any,
      runAction: any,
      posAction: any,
      greetAction: any,
      idleAction: any,
      currentAction: any = null;
    // 加载模型
    gltfLoader.load(
      // 模型路径
      "../../../model/hilda_regular_00.glb",
      // 加载完成回调
      (gltf) => {
        if (window.location.pathname !== "/viewDemo/one/animation") {
          return;
        }
        scene.add(gltf.scene);
        mixer = new THREE.AnimationMixer(gltf.scene);
        walkAction = mixer.clipAction(gltf.animations[37]);
        runAction = mixer.clipAction(gltf.animations[27]);
        idleAction = mixer.clipAction(gltf.animations[6]);
        posAction = mixer.clipAction(gltf.animations[23]);
        greetAction = mixer.clipAction(gltf.animations[0]);
        currentAction = idleAction;
        idleAction.play();
        gui.add(mixer, "timeScale");
        console.log(mixer);
        console.log(gltf);
      }
    );
    let eventObj = {
      stopAll: () => {
        mixer.stopAllAction();
      },
      play: () => {
        console.log(mixer);
        console.log(currentAction);
        // mixer._action[0].play()
        mixer._actions.forEach((action: any) => {
          action.play();
        });
      },
      playRun: () => {
        runAction.enabled = true;
        runAction.setEffectiveTimeScale(1);
        runAction.setEffectiveWeight(1);
        runAction.play();
        currentAction.crossFadeTo(runAction, 0.5, true);
        currentAction = runAction;
      },
      playWalk: () => {
        walkAction.enabled = true;
        walkAction.setEffectiveTimeScale(1);
        walkAction.setEffectiveWeight(1);
        walkAction.play();
        currentAction.crossFadeTo(walkAction, 0.5, true);
        currentAction = walkAction;
      },
      playGreet: () => {
        greetAction.enabled = true;
        greetAction.setEffectiveTimeScale(1);
        greetAction.setEffectiveWeight(1);
        greetAction.play();
        currentAction.crossFadeTo(greetAction, 0.5, true);
        currentAction = greetAction;
      },
      playIdle: () => {
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1);
        idleAction.setEffectiveWeight(1);
        idleAction.play();
        currentAction.crossFadeTo(idleAction, 0.5, true);
        currentAction = idleAction;
      },
      playPos: () => {
        posAction.enabled = true;
        posAction.setEffectiveTimeScale(1);
        posAction.setEffectiveWeight(1);
        posAction.play();
        currentAction.crossFadeTo(posAction, 0.5, true);
        currentAction = posAction;
      },
    };

    gui.add(eventObj, "stopAll");
    gui.add(eventObj, "play");
    gui.add(eventObj, "playRun");
    gui.add(eventObj, "playWalk");
    gui.add(eventObj, "playGreet");
    gui.add(eventObj, "playIdle");
    gui.add(eventObj, "playPos");
    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1),
      material = new THREE.MeshStandardMaterial({
        color: 0xff33ff,
      }),
      cube = new THREE.Mesh(geometry, material);
    cube.name = "cube";
    scene.add(cube);

    // 创建位移动画
    const positionKF = new THREE.VectorKeyframeTrack(
        "cube.position",
        [0, 1, 2, 3, 4],
        [0, 0, 0, 2, 0, 0, 4, 0, 0, 2, 0, 0, 0, 0, 0]
      ),
      quaternion1 = new THREE.Quaternion();
    // quaternion1.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
    quaternion1.setFromEuler(new THREE.Euler(0, 0, 0));
    const quaternion2 = new THREE.Quaternion();
    // quaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    quaternion2.setFromEuler(new THREE.Euler(Math.PI, 0, 0));
    const quaternion3 = new THREE.Quaternion();
    // quaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
    quaternion3.setFromEuler(new THREE.Euler(0, 0, 0));
    console.log(quaternion1, quaternion2, quaternion3);
    const finQ = quaternion1
      .toArray()
      .concat(quaternion2.toArray())
      .concat(quaternion3.toArray());
    console.log(finQ);

    // //  创建旋转动画帧
    const rotationKF = new THREE.QuaternionKeyframeTrack(
        "cube.quaternion",
        [0, 2, 4],
        finQ
      ),
      //布尔关键帧
      boolKF = new THREE.BooleanKeyframeTrack(
        "cube.visible",
        [0, 1, 2, 3, 4],
        [true, false, true, false, true]
      ),
      //颜色关键帧
      colorKF = new THREE.ColorKeyframeTrack(
        "cube.material.color",
        [0, 2, 4],
        [1, 0, 1, 1, 1, 0, 1, 0, 1]
      );
    mixer2 = new THREE.AnimationMixer(cube);
    // 创建动画剪辑
    const clip = new THREE.AnimationClip("move", 4, [
        positionKF,
        rotationKF,
        colorKF,
        boolKF,
      ]),
      // 创建动画动作
      action = mixer2.clipAction(clip);
    action.play();
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
