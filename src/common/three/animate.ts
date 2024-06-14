import scene from "./scene";
import { camera } from "./camera";
import { renderer } from "./renderer";

function animate(): void {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
export default animate;
