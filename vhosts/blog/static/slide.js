document.addEventListener("DOMContentLoaded", async () => {
  const pdfjsLib = globalThis.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

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

    var viewport = page.getViewport({ scale: 1.0 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // TODO: error handling
    await page.render({
      canvasContext: ctx,
      viewport: viewport,
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

  // TODO: error handling
  doc = await pdfjsLib.getDocument(url).promise;
  queueRenderPage(pageNum);
});
