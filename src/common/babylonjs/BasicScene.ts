import { Engine, Scene } from "babylonjs";

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
    const scene = new Scene(this.engine);
    return scene;
  }
  getScene(): Scene {
    return this.scene;
  }
  getcanvas() {
    return this.canvas;
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
