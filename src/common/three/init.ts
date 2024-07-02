import { renderer } from "./renderer";
import { camera } from "./camera";
function windowinit() {
  window.addEventListener("resize", () => {
    // 重置渲染器宽高比
    renderer.setSize(
      (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
        .offsetWidth,
      (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
        .offsetHeight
    );
    // 重置相机宽高比
    camera.aspect =
      (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
        .offsetWidth /
      (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
        .offsetHeight;
    // 更新相机投影矩阵
    camera.updateProjectionMatrix();
  });
}
export { windowinit };
