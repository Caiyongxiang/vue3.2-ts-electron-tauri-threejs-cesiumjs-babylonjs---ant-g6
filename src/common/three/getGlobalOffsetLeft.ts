function getGlobalOffsetLeft(element: any) {
  let totalOffsetLeft = 0,
    totalOffsetTop = 0;

  while (element) {
    totalOffsetLeft += element.offsetLeft;
    totalOffsetTop += element.offsetTop;
    element = element.offsetParent;
  }

  return { totalOffsetLeft, totalOffsetTop };
}
export default getGlobalOffsetLeft;
