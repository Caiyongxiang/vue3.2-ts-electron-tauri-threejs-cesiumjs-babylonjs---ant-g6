// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { camera } from "../three/camera";
function addControls() {
  // 添加轨道控制器
  const controls = new OrbitControls(
    camera,
    document.getElementsByClassName("cyxScene")[0] as HTMLElement
  );
  // 设置带阻尼的惯性
  controls.enableDamping = true;
  // 设置阻尼系数
  controls.dampingFactor = 0.05;
  // 设置旋转速度
  controls.autoRotate = true;
  return controls;
}
export { addControls };
