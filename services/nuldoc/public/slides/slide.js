import { getDocument, GlobalWorkerOptions } from "./pdf.min.mjs";

async function init() {
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const canvas = document.getElementById("slide");
  const ctx = canvas.getContext("2d");
  const url = canvas.dataset.slideLink;

  let pageNum = 1;
  let pageNumPending = null;
  let pageRendering = false;
  let doc = null;

  const renderPage = async (num) => {
    pageRendering = true;
    const page = await doc.getPage(num);

    const baseViewport = page.getViewport({ scale: 1.0 });
    const containerWidth = canvas.parentElement.clientWidth;
    const scale = Math.min(1.0, containerWidth / baseViewport.width);
    const viewport = page.getViewport({ scale });

    const outputScale = globalThis.devicePixelRatio || 1;
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    // TODO: error handling
    await page.render({
      canvasContext: ctx,
      viewport,
      transform,
    });

    pageRendering = false;
    if (pageNumPending !== null) {
      renderPage(pageNumPending);
      pageNumPending = null;
    }
  };

  const queueRenderPage = (num) => {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  };

  const prev = document.getElementById("prev");
  prev.addEventListener("click", () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
  });
  const next = document.getElementById("next");
  next.addEventListener("click", () => {
    if (pageNum >= doc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "h") {
      if (pageNum <= 1) return;
      pageNum--;
      queueRenderPage(pageNum);
    } else if (e.key === "ArrowRight" || e.key === "l") {
      if (pageNum >= doc.numPages) return;
      pageNum++;
      queueRenderPage(pageNum);
    }
  });

  // TODO: error handling
  doc = await getDocument(url).promise;
  queueRenderPage(pageNum);
}

document.addEventListener("DOMContentLoaded", init);
