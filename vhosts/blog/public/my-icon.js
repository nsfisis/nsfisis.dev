const init = () => {
  const SIZE = 100;
  const DPR = globalThis.devicePixelRatio || 1;
  const FPS = 15;

  const colorBackground = "rgb(255, 255, 255)";
  const color蜜柑の果実 = "rgb(255, 165, 0)";
  const color蜜柑の内果皮 = "rgb(255, 255, 255)";
  const color蜜柑のじょうのう = "rgb(255, 255, 255)";
  const colorMosaic = [
    [255, 165, 0],
    [255, 140, 0],
    [255, 215, 0],
    [255, 205, 114],
    [255, 210, 127],
    [255, 192, 76],
    [255, 169, 12],
    [255, 228, 178],
  ];
  const colorEye = "rgb(0, 0, 0)";

  const container = document.getElementById("myIcon");
  const canvas = document.createElement("canvas");
  canvas.width = SIZE * DPR;
  canvas.height = SIZE * DPR;
  canvas.style.width = `${SIZE}px`;
  canvas.style.height = `${SIZE}px`;
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  ctx.scale(DPR, DPR);

  let frameCount = 0;

  function randomChoice(xs) {
    return xs[(Math.random() * xs.length) | 0];
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function draw蜜柑() {
    // 果実、外果皮
    ctx.fillStyle = color蜜柑の果実;
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2);
    ctx.fill();

    // 内果皮
    ctx.strokeStyle = color蜜柑の内果皮;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(50, 50, 45, 0, Math.PI * 2);
    ctx.stroke();

    // じょうのう
    ctx.strokeStyle = color蜜柑のじょうのう;
    ctx.lineWidth = 2;
    for (let t = 0; t < 10; t++) {
      ctx.save();
      ctx.translate(50, 50);
      ctx.rotate((t * Math.PI) / 5);

      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(0, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(-4, -45);
      ctx.lineTo(4, -45);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-3, 0);
      ctx.lineTo(3, 0);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }
  }

  function applyMosaic(k) {
    if (k === 0) return;

    const img = ctx.getImageData(0, 0, SIZE, SIZE);
    const pixels = img.data;

    for (let y = 0; y < SIZE; y += k) {
      for (let x = 50; x < SIZE; x += k) {
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < k; i++) {
          for (let j = 0; j < k; j++) {
            const offset = 4 * ((y + i) * SIZE + (x + j));
            const a = pixels[offset + 3];
            r += a ? pixels[offset + 0] : 255;
            g += a ? pixels[offset + 1] : 255;
            b += a ? pixels[offset + 2] : 255;
          }
        }
        const n = k * k;
        ctx.fillStyle = `rgb(${(r / n) | 0}, ${(g / n) | 0}, ${(b / n) | 0})`;
        ctx.fillRect(x, y, k, k);
      }
    }
  }

  function drawMosaic() {
    for (let dy = 0; dy < 10; dy++) {
      for (let dx = 0; dx < 10; dx++) {
        const y = dy * 10;
        const x = dx * 10;
        if (x < 50) {
          continue;
        }
        if ((x - 45) ** 2 + (y - 45) ** 2 > 55 ** 2) {
          continue;
        }
        if (Math.random() < 0.5) {
          continue;
        }

        const [r, g, b] = randomChoice(colorMosaic);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.75)`;
        ctx.fillRect(x, y, 10, 10);
      }
    }
  }

  function drawEyes() {
    ctx.fillStyle = colorEye;
    roundRect(30, 35, 6, 25, 2);
    roundRect(64, 35, 6, 25, 2);
  }

  function mainLoop() {
    frameCount++;
    if (4 <= frameCount % 15) {
      setTimeout(mainLoop, 1000 / FPS);
      return;
    }

    ctx.fillStyle = colorBackground;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.clearRect(0, 0, SIZE, SIZE);

    draw蜜柑();
    applyMosaic([10, 5, 2, 0][frameCount % 15]);
    drawMosaic();
    drawEyes();

    setTimeout(mainLoop, 1000 / FPS);
  }
  setTimeout(mainLoop, 2000);
};

document.addEventListener("DOMContentLoaded", init);
