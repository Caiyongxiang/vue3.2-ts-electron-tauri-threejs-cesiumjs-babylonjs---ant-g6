import {
  Engine,
  MeshBuilder,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
} from "babylonjs";

export default class BasicScene {
  engine: Engine;
  scene: Scene;
  canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.getElementsByClassName(
      "cyxScene"
    )[0] as HTMLCanvasElement;
    this.engine = new Engine(this.canvas); // 初始化引擎
    this.scene = this.createScene(); // 创建场景
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  createScene(): Scene {
    const scene = new Scene(this.engine),
      camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2.5,
        3,
        new Vector3(0, 0, 0),
        scene
      );
    camera.attachControl(this.canvas, true); // 注意：修改了拼写错误
    new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    MeshBuilder.CreateBox("box", {}, scene); // 将盒子添加到场景中

    return scene;
  }
  onWindowResize = () => {
    this.engine.resize();
  };

  // 销毁引擎，释放资源
  dispose() {
    this.scene.dispose();
    this.engine.dispose();
    window.removeEventListener("resize", this.onWindowResize);
  }
}
