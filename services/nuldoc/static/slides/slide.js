import { getDocument, GlobalWorkerOptions } from "./pdf.min.mjs";

async function init() {
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const canvas = document.getElementById("slide");
  const ctx = canvas.getContext("2d");
  const url = canvas.dataset.slideLink;

  let pageNum = 1;
  let doc = null;
  let renderTask = null;
  let renderToken = 0;

  const backCanvas = document.createElement("canvas");
  const backCtx = backCanvas.getContext("2d");

  const renderPage = async (num) => {
    const token = ++renderToken;
    if (renderTask !== null) {
      renderTask.cancel();
      renderTask = null;
    }

    const page = await doc.getPage(num);
    if (token !== renderToken) return;

    const baseViewport = page.getViewport({ scale: 1.0 });
    const containerWidth = canvas.parentElement.clientWidth;
    const scale = containerWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const outputScale = globalThis.devicePixelRatio || 1;
    const cssWidth = Math.floor(viewport.width);
    const cssHeight = Math.floor(viewport.height);
    backCanvas.width = Math.floor(viewport.width * outputScale);
    backCanvas.height = Math.floor(viewport.height * outputScale);

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    // TODO: error handling
    const task = page.render({
      canvasContext: backCtx,
      viewport,
      transform,
    });
    renderTask = task;
    try {
      await task.promise;
    } catch (e) {
      if (e?.name === "RenderingCancelledException") return;
      throw e;
    } finally {
      if (renderTask === task) renderTask = null;
    }
    if (token !== renderToken) return;

    if (canvas.width !== backCanvas.width || canvas.height !== backCanvas.height) {
      canvas.width = backCanvas.width;
      canvas.height = backCanvas.height;
      canvas.style.width = cssWidth + "px";
      canvas.style.height = cssHeight + "px";
    }
    ctx.drawImage(backCanvas, 0, 0);
  };

  const prev = document.getElementById("prev");
  prev.addEventListener("click", () => {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
  });
  const next = document.getElementById("next");
  next.addEventListener("click", () => {
    if (pageNum >= doc.numPages) return;
    pageNum++;
    renderPage(pageNum);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "h") {
      if (pageNum <= 1) return;
      pageNum--;
      renderPage(pageNum);
    } else if (e.key === "ArrowRight" || e.key === "l") {
      if (pageNum >= doc.numPages) return;
      pageNum++;
      renderPage(pageNum);
    }
  });

  // TODO: error handling
  doc = await getDocument(url).promise;
  renderPage(pageNum);
}

document.addEventListener("DOMContentLoaded", init);
