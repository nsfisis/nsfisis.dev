import {
  AnnotationLayer,
  getDocument,
  GlobalWorkerOptions,
  TextLayer,
} from "./pdf.min.mjs";

const PAGE_HASH_PATTERN = /^#p(\d+)$/;
// How long to wait before re-rendering, so a drag-resize does not redraw on every frame.
const RESIZE_DEBOUNCE_MS = 150;
// How long to wait before showing the indicator, so quick renders do not flash it.
const RENDER_INDICATOR_DELAY_MS = 200;
// How many pages around the current one to render ahead of time.
const PREFETCH_RADIUS = 1;

function pageFromHash(hash) {
  const matched = PAGE_HASH_PATTERN.exec(hash);
  if (matched === null) return null;
  const num = Number(matched[1]);
  return num >= 1 ? num : null;
}

async function init() {
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const container = document.getElementById("slide-container");
  const stage = document.getElementById("slide-stage");
  const canvas = document.getElementById("slide");
  const ctx = canvas.getContext("2d");
  const textLayerDiv = document.getElementById("text-layer");
  const annotationLayerDiv = document.getElementById("annotation-layer");
  const status = document.getElementById("slide-status");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const pageInput = document.getElementById("page-input");
  const pageCount = document.getElementById("page-count");
  const url = container.dataset.slideLink;

  let doc = null;
  let pageNum = 1;
  let renderToken = 0;
  let textLayer = null;
  let stageWidth = 0;
  // `${pageNumber}@${width}` -> { image, layers }. Both are promises.
  const cache = new Map();

  const hideStatus = () => {
    status.hidden = true;
    status.replaceChildren();
    delete status.dataset.state;
  };

  const showStatus = (state, message) => {
    status.dataset.state = state;
    status.replaceChildren(message);
    status.hidden = false;
  };

  const showFailure = (message) => {
    const description = document.createElement("p");
    description.textContent = message;
    const fallback = document.createElement("a");
    fallback.href = url;
    fallback.textContent = "PDF を直接開く";
    status.dataset.state = "error";
    status.replaceChildren(description, fallback);
    status.hidden = false;
  };

  const renderToOffscreenCanvas = async (page, width) => {
    const scale = width / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });
    const outputScale = globalThis.devicePixelRatio || 1;

    const target = document.createElement("canvas");
    target.width = Math.floor(viewport.width * outputScale);
    target.height = Math.floor(viewport.height * outputScale);
    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    await page.render({
      canvasContext: target.getContext("2d"),
      viewport,
      transform,
    }).promise;

    return {
      canvas: target,
      viewport,
      cssWidth: Math.floor(viewport.width),
      cssHeight: Math.floor(viewport.height),
      // Factor the text/annotation layers use to convert PDF units into CSS px.
      totalScaleFactor: viewport.width / viewport.rawDims.pageWidth,
    };
  };

  // Cache the rendered result itself; same page at the same width returns instantly.
  const entryFor = (num, width) => {
    const key = `${num}@${width}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const page = doc.getPage(num);
    const entry = {
      image: page.then((p) => renderToOffscreenCanvas(p, width)),
      layers: page.then(async (p) => ({
        page: p,
        textContent: await p.getTextContent(),
        annotations: await p.getAnnotations({ intent: "display" }),
      })),
    };
    // Drop rejected promises, otherwise a failure would never be retried.
    const forget = () => {
      if (cache.get(key) === entry) cache.delete(key);
    };
    entry.image.catch(forget);
    entry.layers.catch(forget);

    cache.set(key, entry);
    return entry;
  };

  const sweepCache = () => {
    for (const key of cache.keys()) {
      const [num, width] = key.split("@").map(Number);
      if (width !== stageWidth || Math.abs(num - pageNum) > PREFETCH_RADIUS) {
        cache.delete(key);
      }
    }
  };

  const prefetchNeighbors = () => {
    for (let d = 1; d <= PREFETCH_RADIUS; d++) {
      for (const num of [pageNum + d, pageNum - d]) {
        if (num < 1 || num > doc.numPages) continue;
        entryFor(num, stageWidth);
      }
    }
  };

  const drawImage = ({ canvas: source, cssWidth, cssHeight }) => {
    if (canvas.width !== source.width || canvas.height !== source.height) {
      canvas.width = source.width;
      canvas.height = source.height;
    }
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.drawImage(source, 0, 0);
  };

  const renderOverlays = async (entry, viewport, token) => {
    if (textLayer !== null) {
      textLayer.cancel();
      textLayer = null;
    }
    textLayerDiv.replaceChildren();
    annotationLayerDiv.replaceChildren();

    const { page, textContent, annotations } = await entry.layers;
    if (token !== renderToken) return;

    const layer = new TextLayer({
      textContentSource: textContent,
      container: textLayerDiv,
      viewport,
    });
    textLayer = layer;
    try {
      await layer.render();
    } catch {
      // Cancelled by a move to another page; leave it to the newer render.
      return;
    }
    if (token !== renderToken) return;

    if (annotations.length === 0) return;
    await new AnnotationLayer({
      div: annotationLayerDiv,
      page,
      viewport: viewport.clone({ dontFlip: true }),
      linkService,
    }).render({ annotations, renderForms: false });
  };

  const renderPage = async (num) => {
    // No measurable width (e.g. hidden); leave it to the ResizeObserver re-render.
    if (stageWidth === 0) return;

    const token = ++renderToken;
    const entry = entryFor(num, stageWidth);

    const indicator = globalThis.setTimeout(() => {
      if (token === renderToken) showStatus("loading", "描画中…");
    }, RENDER_INDICATOR_DELAY_MS);

    try {
      const image = await entry.image;
      if (token !== renderToken) return;

      globalThis.clearTimeout(indicator);
      hideStatus();
      stage.style.setProperty("--total-scale-factor", image.totalScaleFactor);
      drawImage(image);
      await renderOverlays(entry, image.viewport, token);
    } catch (e) {
      if (token !== renderToken) return;
      console.error(e);
      showFailure("スライドの描画に失敗しました。");
    } finally {
      globalThis.clearTimeout(indicator);
      if (token === renderToken) {
        sweepCache();
        prefetchNeighbors();
      }
    }
  };

  const syncControls = () => {
    prev.disabled = pageNum <= 1;
    next.disabled = doc === null || pageNum >= doc.numPages;
    if (document.activeElement !== pageInput) {
      pageInput.value = String(pageNum);
    }
  };

  const writeHash = (num) => {
    const hash = `#p${num}`;
    if (globalThis.location.hash === hash) return;
    // Pushing an entry per page would make the back button useless.
    globalThis.history.replaceState(null, "", hash);
  };

  const goToPage = (num, { updateHash = true } = {}) => {
    if (doc === null || !Number.isFinite(num)) return;
    pageNum = Math.min(Math.max(Math.trunc(num), 1), doc.numPages);
    syncControls();
    if (updateHash) writeHash(pageNum);
    renderPage(pageNum);
  };

  const linkService = {
    addLinkAttributes(link, href, newWindow) {
      link.href = href;
      link.rel = "noopener noreferrer";
      if (newWindow) link.target = "_blank";
    },
    getDestinationHash() {
      return "#";
    },
    getAnchorUrl(hash) {
      return hash;
    },
    async goToDestination(dest) {
      if (doc === null) return;
      const explicit = typeof dest === "string"
        ? await doc.getDestination(dest)
        : dest;
      if (!Array.isArray(explicit) || explicit.length === 0) return;
      const ref = explicit[0];
      const index = typeof ref === "object" && ref !== null
        ? await doc.getPageIndex(ref)
        : Number(ref);
      goToPage(index + 1);
    },
    executeNamedAction(action) {
      switch (action) {
        case "GoBack":
        case "PrevPage":
          goToPage(pageNum - 1);
          break;
        case "GoForward":
        case "NextPage":
          goToPage(pageNum + 1);
          break;
        case "FirstPage":
          goToPage(1);
          break;
        case "LastPage":
          goToPage(doc.numPages);
          break;
        default:
          break;
      }
    },
    executeSetOCGState() {},
  };

  prev.addEventListener("click", () => goToPage(pageNum - 1));
  next.addEventListener("click", () => goToPage(pageNum + 1));

  document.addEventListener("keydown", (e) => {
    if (e.target === pageInput) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowLeft" || e.key === "h") {
      goToPage(pageNum - 1);
    } else if (e.key === "ArrowRight" || e.key === "l") {
      goToPage(pageNum + 1);
    } else {
      return;
    }
    e.preventDefault();
  });

  const commitPageInput = () => {
    const value = Number(pageInput.value);
    if (Number.isFinite(value) && pageInput.value !== "") {
      goToPage(value);
    }
    pageInput.value = String(pageNum);
  };
  pageInput.addEventListener("change", commitPageInput);
  pageInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    commitPageInput();
  });

  globalThis.addEventListener("hashchange", () => {
    const num = pageFromHash(globalThis.location.hash);
    if (num !== null && num !== pageNum) goToPage(num, { updateHash: false });
  });

  let resizeTimer = 0;
  const measure = () => Math.floor(container.clientWidth);
  new ResizeObserver(() => {
    globalThis.clearTimeout(resizeTimer);
    resizeTimer = globalThis.setTimeout(() => {
      const width = measure();
      if (width === 0 || width === stageWidth) return;
      stageWidth = width;
      cache.clear();
      if (doc !== null) renderPage(pageNum);
    }, RESIZE_DEBOUNCE_MS);
  }).observe(container);

  stageWidth = measure();
  syncControls();
  showStatus("loading", "読み込み中……");

  const loadingTask = getDocument(url);
  loadingTask.onProgress = ({ loaded, total }) => {
    if (doc !== null) return;
    const percent = total > 0
      ? Math.min(100, Math.round((loaded / total) * 100))
      : null;
    showStatus(
      "loading",
      percent === null ? "読み込み中……" : `読み込み中…… ${percent}%`,
    );
  };

  try {
    doc = await loadingTask.promise;
  } catch (e) {
    console.error(e);
    showFailure("スライドの読み込みに失敗しました。");
    return;
  }

  pageCount.textContent = String(doc.numPages);
  pageInput.max = String(doc.numPages);
  pageNum = Math.min(pageFromHash(globalThis.location.hash) ?? 1, doc.numPages);
  syncControls();
  renderPage(pageNum);
}

document.addEventListener("DOMContentLoaded", init);
