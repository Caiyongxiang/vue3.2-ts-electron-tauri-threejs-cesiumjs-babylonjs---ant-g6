import THREE from "./three";
// 创建相机
let camera = new THREE.PerspectiveCamera();
function fncamera() {
  console.log(22222);
  camera = new THREE.PerspectiveCamera(
    45,
    (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
      .offsetWidth /
      (document.getElementsByClassName("cyxScene")[0] as HTMLElement)
        .offsetHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  camera.lookAt(0, 0, 0);
}
export { fncamera, camera };
