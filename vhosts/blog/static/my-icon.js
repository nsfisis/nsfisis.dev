const colorBackground = 'white';
const color蜜柑の果実 = [255, 165, 0];
const color蜜柑の内果皮 = [255, 255, 255];
const color蜜柑のじょうのう = [255, 255, 255];
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
const colorEye = [0, 0, 0];

function setup() {
  const container = document.getElementById("p5jsMyIcon");
  const canvas = createCanvas(100, 100);
  canvas.parent(container);

  background(colorBackground);
  frameRate(15);
}

function draw() {
  if (4 <= frameCount % 15) {
    return;
  }

  clear();

  draw蜜柑();
  applyMosaicEffect([10, 5, 2, 0][frameCount % 15]);
  drawMosaic();
  drawEyes();
}

function applyMosaicEffect(k) {
  if (k === 0) {
    return;
  }

  loadPixels();
  noStroke();
  const d = pixelDensity();
  for (let y = 0; y < 100; y += k) {
    for (let x = 50; x < 100; x += k) {
      var r = 0, g = 0, b = 0;
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          const offset = 4 * d * ((y + i) * 100 * d + (x + j));
          const r_ = pixels[offset];
          const g_ = pixels[offset + 1];
          const b_ = pixels[offset + 2];
          const a_ = pixels[offset + 3];
          r += a_ === 0 ? red(colorBackground) : r_;
          g += a_ === 0 ? green(colorBackground) : g_;
          b += a_ === 0 ? blue(colorBackground) : b_;
        }
      }
      fill(r / k**2, g / k**2, b / k**2);
      rect(x, y, k, k);
    }
  }
}

function draw蜜柑() {
  // 果実、外果皮
  fill(color蜜柑の果実);
  noStroke();
  ellipse(50, 50, 100, 100);

  // 内果皮
  noFill();
  stroke(color蜜柑の内果皮);
  strokeWeight(4);
  ellipse(50, 50, 90, 90);

  // じょうのう
  stroke(color蜜柑のじょうのう);
  strokeWeight(2);
  for (let t = 0; t < 10; t++) {
    push();
    translate(50, 50);
    rotate(t * PI / 5);
    line(0, -45, 0, 0);
    triangle(0, -40, -4, -45, 4, -45);
    triangle(0, -20, -3, 0, 3, 0);
    pop();
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
      if ((x - 45)**2 + (y - 45)**2 > 55**2) {
        continue;
      }
      if (random() < 0.5) {
        continue;
      }
      const [r, g, b] = random(colorMosaic);
      noStroke();
      fill(r, g, b, 192);
      rect(x, y, 10, 10);
    }
  }
}

function drawEyes() {
  noStroke();
  fill(colorEye);
  rect(30, 35, 6, 25, 2);
  rect(64, 35, 6, 25, 2);
}
