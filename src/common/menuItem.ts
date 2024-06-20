type MenuItem = {
  key: string;
  label: string;
  children?: MenuItem[];
};
const Items: MenuItem[] = [
  {
    key: "viewDemo",
    label: "threejs基础递进巩固",
    children: [{ key: "oneFirstView", label: "第一个3d界面" }],
  },
  {
    key: "webDemo",
    label: "threejs官网案例复刻",
    children: [{ key: "21", label: "第一个3d界面" }],
  },
  {
    key: "babylonjs",
    label: "babylonjs基础学习",
    children: [{ key: "BasicView", label: "第一个3d界面" }],
  },
];
export default Items;
