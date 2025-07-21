import { refreshMap } from './map.js'


export function isFullResEnabled() {
  return document.getElementById('fullres-toggle').checked
}

export function isMagnyfingEnabled(){
  return document.getElementById('magnifying-toggle').checked
}

export function setupResizers() {
  // Vertical resizer between left and right
  const resizerCol = document.getElementById("resizer-col");
  const container = document.getElementById("container");
  const containerNav = document.getElementById("container-nav");
  const imagePanel = document.getElementById("image-panel");

  let isResizingCol = false;
  resizerCol.addEventListener("mousedown", () => {
    isResizingCol = true;
    document.body.style.cursor = "col-resize";
  })

  window.addEventListener("mousemove", e => {
    if (!isResizingCol) return;
    const containerWidth = container.offsetWidth;
    const leftWidth = e.clientX;
    const rightWidth = containerWidth - leftWidth - 5;
    containerNav.style.width = `${leftWidth}px`;
    imagePanel.style.width = `${rightWidth}px`;
  })

  window.addEventListener("mouseup", () => {
    isResizingCol = false;
    document.body.style.cursor = "default";
    refreshMap();
  })

  // Horizontal resizer between map and nav
  const resizerRaw = document.getElementById("resizer-raw");
  const mapDiv = document.getElementById("map");
  const navDiv = document.getElementById("nav");

  let isResizingRow = false;

  resizerRaw.addEventListener("mousedown", function(e) {
    isResizingRow = true;
    document.body.style.cursor = "row-resize";
  });

  window.addEventListener("mousemove", function(e) {
    if (!isResizingRow) return;
    const containerNavHeight = containerNav.offsetHeight;
    const topHeight = e.clientY - containerNav.getBoundingClientRect().top;
    const bottomHeight = containerNavHeight - topHeight - 5;
    mapDiv.style.height = `${topHeight}px`;
    navDiv.style.height = `${bottomHeight}px`;
  });

  window.addEventListener("mouseup", function() {
    isResizingRow = false;
    document.body.style.cursor = "default";
    refreshMap();
  });
}
