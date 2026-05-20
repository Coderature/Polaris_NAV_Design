// src/scene/amazonCampus.ts
import * as THREE from "three";
var GROUND_XZ = 1.25;
var gx = (n) => n * GROUND_XZ;
var C = {
  amazonOrange: "#ff9900",
  amazonOrangeBright: "#ffb53e",
  amazonDark: "#232f3e",
  amazonBlack: "#131921",
  amazonNavy: "#1a2433",
  primeBlue: "#00a8e1",
  primeDeep: "#0a6dba",
  alexaBlue: "#1ba1e2",
  alexaCyan: "#4ad9ff",
  cloudWhite: "#f3f3f3",
  cloudGrey: "#dfdfdf",
  brownBox: "#a67c52",
  brownBoxDark: "#7a5634",
  awsOrange: "#ff9900",
  awsDark: "#252f3e",
  yellowRobot: "#f5c518",
  yellowRobotDark: "#c4980e",
  pinkBest: "#d6336c",
  metalDark: "#3a3a40",
  metal: "#7a7a80",
  silver: "#c8c8cc",
  glass: "#4a8eda",
  glassWarm: "#ffb53e",
  glassBlue: "#3a78c8",
  road: "#1c1e22",
  base: "#08090d",
  platform: "#15171c",
  grass: "#2d8c4a",
  bark: "#7a4b2a",
  screen: "#0a1d3a",
  screenBright: "#1a4d80",
  hotData: "#ff7a92",
  goldGlow: "#ffd700"
};
var mat = (color, o = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: o.roughness ?? 0.6,
  metalness: o.metalness ?? 0.08,
  transparent: o.transparent ?? false,
  opacity: o.opacity ?? 1,
  emissive: o.emissive ?? "#000000",
  emissiveIntensity: o.emissiveIntensity ?? 0,
  side: o.side ?? THREE.FrontSide
});
var M = {
  amazonOrange: mat(C.amazonOrange, { emissive: C.amazonOrange, emissiveIntensity: 0.5, roughness: 0.3 }),
  amazonOrangeHot: mat(C.amazonOrange, { emissive: C.amazonOrangeBright, emissiveIntensity: 1.4, roughness: 0.25 }),
  amazonDark: mat(C.amazonDark, { roughness: 0.55 }),
  amazonBlack: mat(C.amazonBlack, { roughness: 0.5 }),
  amazonNavy: mat(C.amazonNavy, { roughness: 0.5, metalness: 0.2 }),
  primeBlue: mat(C.primeBlue, { roughness: 0.35, emissive: C.primeBlue, emissiveIntensity: 0.15 }),
  primeDeep: mat(C.primeDeep, { roughness: 0.35 }),
  alexaBlue: mat(C.alexaBlue, { emissive: C.alexaBlue, emissiveIntensity: 1, roughness: 0.25 }),
  cloudWhite: mat(C.cloudWhite, { roughness: 0.35, emissive: "#ffffff", emissiveIntensity: 0.1 }),
  brownBox: mat(C.brownBox, { roughness: 0.75 }),
  brownBoxDark: mat(C.brownBoxDark, { roughness: 0.7 }),
  yellowRobot: mat(C.yellowRobot, { roughness: 0.3, metalness: 0.55, emissive: "#3a2a04", emissiveIntensity: 0.2 }),
  pinkAccent: mat(C.pinkBest, { emissive: C.pinkBest, emissiveIntensity: 0.5 }),
  metalDark: mat(C.metalDark, { roughness: 0.35, metalness: 0.65 }),
  metal: mat(C.metal, { roughness: 0.35, metalness: 0.55 }),
  silver: mat(C.silver, { roughness: 0.32, metalness: 0.55 }),
  white: mat("#f4f4f4", { roughness: 0.4 }),
  whiteHot: mat("#ffffff", { emissive: "#ffffff", emissiveIntensity: 1.2, roughness: 0.25 }),
  glass: mat(C.glass, { roughness: 0.15, metalness: 0.15, transparent: true, opacity: 0.55, emissive: "#1e4fa3", emissiveIntensity: 0.15 }),
  glassWarm: mat(C.glassWarm, { emissive: "#ffaf3a", emissiveIntensity: 0.8, roughness: 0.25 }),
  glassBlue: mat(C.glassBlue, { roughness: 0.15, metalness: 0.15, transparent: true, opacity: 0.65 }),
  road: mat(C.road, { roughness: 0.85 }),
  base: mat(C.base, { roughness: 0.55 }),
  platform: mat(C.platform, { roughness: 0.65 }),
  grass: mat(C.grass, { roughness: 0.85 }),
  bark: mat(C.bark, { roughness: 0.85 }),
  screen: mat(C.screen, { emissive: C.screen, emissiveIntensity: 0.4, roughness: 0.15 }),
  screenBright: mat(C.screenBright, { emissive: C.screenBright, emissiveIntensity: 1, roughness: 0.15 }),
  dataBead: new THREE.MeshStandardMaterial({
    color: C.hotData,
    emissive: C.hotData,
    emissiveIntensity: 2,
    roughness: 0.25
  }),
  goldCoin: new THREE.MeshStandardMaterial({
    color: "#ffd700",
    emissive: "#ffaa00",
    emissiveIntensity: 1.6,
    roughness: 0.25,
    metalness: 0.85
  })
};
function box(g, name, x, y, z, sx, sy, sz, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
function cyl(g, name, x, y, z, r, h, material, radial = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radial), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function drawAmazonSmile(ctx, cx, cy, w, color) {
  const r = w / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = w * 0.13;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.05, r, 0.05 * Math.PI, 0.95 * Math.PI, false);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  const ax = cx + r * 0.97;
  const ay = cy + r * 0.16;
  ctx.moveTo(ax + r * 0.06, ay - r * 0.05);
  ctx.lineTo(ax + r * 0.22, ay - r * 0.18);
  ctx.lineTo(ax - r * 0.05, ay - r * 0.12);
  ctx.closePath();
  ctx.fill();
}
function makeAmazonLogoTexture(bg = "#131921", fg = "#ffffff", orange = "#ff9900") {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 384;
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = fg;
  ctx.font = "bold 220px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("amazon", c.width / 2, c.height / 2 - 30);
  drawAmazonSmile(ctx, c.width / 2, c.height / 2 + 80, 480, orange);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeAmazonDotComBannerTexture() {
  const c = document.createElement("canvas");
  c.width = 1536;
  c.height = 384;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0a0e16";
  roundRect(ctx, 0, 0, c.width, c.height, 30);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 130px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("amazon", 120, 140);
  ctx.fillStyle = "#bbb";
  ctx.font = "110px Arial";
  ctx.fillText(".com", 720, 140);
  drawAmazonSmile(ctx, 380, 200, 540, "#ff9900");
  ctx.fillStyle = "#dfdfdf";
  ctx.font = "52px Arial";
  ctx.fillText("Customer Obsession \xB7 Long-term Thinking", 120, 310);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeAWSCloudTexture() {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 512;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#252f3e";
  ctx.font = "bold 200px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("aws", c.width / 2, c.height / 2 - 20);
  drawAmazonSmile(ctx, c.width / 2, c.height / 2 + 100, 380, "#ff9900");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeFulfillmentLabelTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 192;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0a0e16";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "italic 120px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("fulfillment", c.width / 2, c.height / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeBestSellerTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#232f3e";
  ctx.fillRect(0, 0, c.width, 70);
  ctx.fillStyle = "#ff9900";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Best Seller", 30, 35);
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 250, 18, 700, 35, 6);
  ctx.fill();
  const products = [
    { x: 80, name: "Headphones", color: "#2a2a2a", shape: "headphones" },
    { x: 380, name: "Mug", color: "#1a1a1a", shape: "mug" },
    { x: 680, name: "Bottle", color: "#d4d4d4", shape: "bottle" }
  ];
  products.forEach((p, i) => {
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, p.x, 100, 260, 480, 16);
    ctx.fill();
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = p.color;
    if (p.shape === "headphones") {
      ctx.beginPath();
      ctx.arc(p.x + 130, 280, 80, Math.PI, 0);
      ctx.lineTo(p.x + 210, 290);
      ctx.lineTo(p.x + 50, 290);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#444";
      ctx.beginPath();
      ctx.arc(p.x + 70, 280, 35, 0, Math.PI * 2);
      ctx.arc(p.x + 190, 280, 35, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === "mug") {
      ctx.fillRect(p.x + 80, 220, 100, 130);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(p.x + 195, 275, 30, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (p.shape === "bottle") {
      ctx.fillRect(p.x + 100, 180, 60, 25);
      ctx.fillRect(p.x + 90, 200, 80, 170);
      ctx.beginPath();
      ctx.arc(p.x + 130, 370, 40, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ff9900";
    roundRect(ctx, p.x + 16, 380, 100, 24, 4);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Best Seller", p.x + 66, 395);
    ctx.fillStyle = "#ff9900";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("\u2605\u2605\u2605\u2605\u2605", p.x + 16, 440);
    ctx.fillStyle = "#0a3a8a";
    ctx.font = "bold 24px Arial";
    ctx.fillText("$" + (29 + i * 17 % 70) + ".99", p.x + 16, 475);
    ctx.fillStyle = "#333";
    ctx.font = "14px Arial";
    ctx.fillText(p.name, p.x + 16, 505);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makePrimeVideoTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 576;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, c.width, c.height);
  const posters = [
    { x: 60, color1: "#3a4a8a", color2: "#1a2050" },
    { x: 380, color1: "#8a1a3a", color2: "#3a0a1a" },
    { x: 700, color1: "#2a6a4a", color2: "#0a3a2a" }
  ];
  posters.forEach((p) => {
    const grad = ctx.createLinearGradient(p.x, 100, p.x, 480);
    grad.addColorStop(0, p.color1);
    grad.addColorStop(1, p.color2);
    ctx.fillStyle = grad;
    roundRect(ctx, p.x, 100, 260, 380, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.arc(p.x + 130, 280, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x + 70, 480);
    ctx.lineTo(p.x + 190, 480);
    ctx.lineTo(p.x + 170, 350);
    ctx.lineTo(p.x + 90, 350);
    ctx.closePath();
    ctx.fill();
  });
  ctx.fillStyle = "#00a8e1";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("prime", 60, 50);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("video", 200, 50);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeKindleTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 768;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#1a1a1d";
  roundRect(ctx, 0, 0, c.width, c.height, 30);
  ctx.fill();
  const grad = ctx.createLinearGradient(0, 80, 0, c.height - 80);
  grad.addColorStop(0, "#3a4a6a");
  grad.addColorStop(1, "#0a1a3a");
  ctx.fillStyle = grad;
  roundRect(ctx, 30, 80, c.width - 60, c.height - 160, 8);
  ctx.fill();
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(80, c.height - 180, 360, 20);
  ctx.fillRect(80, c.height - 380, 100, 220);
  ctx.fillRect(380, c.height - 380, 60, 220);
  ctx.beginPath();
  ctx.arc(280, c.height - 380, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(180, c.height - 320, 220, 160);
  ctx.fillStyle = "#fff5d4";
  ctx.fillRect(220, c.height - 280, 120, 80);
  ctx.fillStyle = "#ff9900";
  ctx.font = "bold 64px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("kindle", c.width / 2, 50);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeAmazonMusicTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 768;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, "#5a1a8a");
  grad.addColorStop(1, "#1a0a3a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "#ff9900";
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.arc(c.width / 2, 380, 140, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = "#1a1a1d";
  ctx.beginPath();
  ctx.arc(c.width / 2 - 140, 380, 70, 0, Math.PI * 2);
  ctx.arc(c.width / 2 + 140, 380, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a259ff";
  ctx.beginPath();
  ctx.arc(c.width / 2 - 140, 380, 50, 0, Math.PI * 2);
  ctx.arc(c.width / 2 + 140, 380, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("amazon music", c.width / 2, 100);
  drawAmazonSmile(ctx, c.width / 2 - 60, 150, 260, "#ff9900");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeAmazonAdsTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0a0e16";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("amazon ads", 60, 90);
  drawAmazonSmile(ctx, 240, 140, 320, "#ff9900");
  const barCount = 12;
  const barW = 50;
  const startX = 80;
  const baseY = 480;
  for (let i = 0; i < barCount; i++) {
    const h = 30 + i * 25 + Math.sin(i * 0.5) * 15;
    ctx.fillStyle = i === barCount - 1 ? "#ff9900" : "#00a8e1";
    ctx.fillRect(startX + i * (barW + 14), baseY - h, barW, h);
  }
  ctx.strokeStyle = "#3a3a40";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, baseY + 5);
  ctx.lineTo(c.width - 60, baseY + 5);
  ctx.stroke();
  const metrics = [
    { label: "Impressions", value: "2.35B", x: 80 },
    { label: "Clicks", value: "98.6M", x: 410 },
    { label: "ACoS", value: "21%", x: 740 }
  ];
  metrics.forEach((m) => {
    ctx.fillStyle = "#dfdfdf";
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.fillText(m.label, m.x, 555);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px Arial";
    ctx.fillText(m.value, m.x, 605);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeEchoShowTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 180px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("10:10", c.width / 2, c.height / 2 - 20);
  ctx.fillStyle = "#aaaaaa";
  ctx.font = "48px Arial";
  ctx.fillText("72\xB0", c.width / 2 + 130, c.height / 2 + 100);
  ctx.fillStyle = "#ffcf3a";
  ctx.beginPath();
  ctx.arc(c.width / 2 - 100, c.height / 2 + 100, 28, 0, Math.PI * 2);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeFireTVTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, "#1a3a5a");
  grad.addColorStop(1, "#0a1a3a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#ff9900";
  ctx.font = "bold 56px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("fire", c.width / 2, c.height / 2 - 30);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Arial";
  ctx.fillText("TV", c.width / 2, c.height / 2 + 30);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeLabelPanelTexture(num, korTitle, korSubtitle, accentColor = "#ff9900") {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 280;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0a0a0a";
  roundRect(ctx, 6, 6, c.width - 12, c.height - 12, 32);
  ctx.fill();
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 3;
  roundRect(ctx, 6, 6, c.width - 12, c.height - 12, 32);
  ctx.stroke();
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(90, 85, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(num, 90, 88);
  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 50px "Malgun Gothic", Arial';
  ctx.textAlign = "left";
  ctx.fillText(korTitle, 160, 85);
  if (korSubtitle) {
    ctx.fillStyle = "#c4c4c8";
    ctx.font = '30px "Malgun Gothic", Arial';
    const lines = korSubtitle.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, 50, 175 + i * 40);
    });
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function makeFacadeTextTexture(text, bg = "#131921", fg = "#ffffff") {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 192;
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = fg;
  ctx.font = "bold 100px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, c.width / 2, c.height / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function texturedPlane(g, tex, x, y, z, w, h, rotY = 0, emissive = 0.3) {
  const m = new THREE.MeshStandardMaterial({
    map: tex,
    side: THREE.DoubleSide,
    roughness: 0.4,
    emissive: "#ffffff",
    emissiveMap: tex,
    emissiveIntensity: emissive
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  g.add(mesh);
  return mesh;
}
function rooftopPanel(g, num, title, subtitle, x, y, z, w = 1, h = 0.36, accent = "#ff9900") {
  const tex = makeLabelPanelTexture(num, title, subtitle, accent);
  const m = new THREE.MeshStandardMaterial({
    map: tex,
    side: THREE.DoubleSide,
    roughness: 0.4,
    emissive: "#ffffff",
    emissiveMap: tex,
    emissiveIntensity: 0.4
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.position.set(x, y, z);
  g.add(mesh);
  cyl(g, `panel post ${num}`, x, y - h / 2 - 0.16, z, 0.014, 0.32, M.silver, 8);
  return mesh;
}
function tree(g, x, z, s = 0.5) {
  cyl(g, "tree trunk", x, 0.23 * s / 0.5, z, 0.035, 0.38 * s / 0.5, M.bark, 10);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.18 * s / 0.5, 16, 12), mat("#2f7d42", { roughness: 0.8 }));
  crown.position.set(x, 0.52 * s / 0.5, z);
  crown.castShadow = true;
  crown.receiveShadow = true;
  g.add(crown);
}
function createPackageBox(g, x, y, z, scale = 1, rotY = 0) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.rotation.y = rotY;
  grp.scale.setScalar(scale);
  g.add(grp);
  box(grp, "pkg body", 0, 0.06, 0, 0.16, 0.12, 0.12, M.brownBox);
  box(grp, "pkg tape", 0, 0.06, 0.061, 0.18, 0.025, 5e-3, mat("#7a5634"));
  box(grp, "pkg smile", 0, 0.085, 0.063, 0.06, 0.012, 5e-3, M.amazonOrange);
  box(grp, "pkg smile dot", 0.022, 0.078, 0.063, 8e-3, 8e-3, 5e-3, M.amazonOrange);
  return grp;
}
function createPrimeTruck(g, x, y, z, rotY = 0, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.rotation.y = rotY;
  grp.scale.setScalar(scale);
  g.add(grp);
  box(grp, "truck cabin", -0.14, 0.06, 0, 0.12, 0.1, 0.14, mat("#1a3a6a", { metalness: 0.35 }));
  box(grp, "truck windshield", -0.18, 0.085, 0, 0.04, 0.05, 0.13, M.glassBlue);
  box(grp, "truck container", 0.05, 0.075, 0, 0.32, 0.14, 0.16, M.primeDeep);
  const primeLogoTex = (() => {
    const cc = document.createElement("canvas");
    cc.width = 384;
    cc.height = 192;
    const cctx = cc.getContext("2d");
    cctx.fillStyle = "#0a6dba";
    cctx.fillRect(0, 0, cc.width, cc.height);
    cctx.fillStyle = "#ffffff";
    cctx.font = "bold 80px Arial";
    cctx.textAlign = "center";
    cctx.textBaseline = "middle";
    cctx.fillText("prime", cc.width / 2, cc.height / 2 - 10);
    drawAmazonSmile(cctx, cc.width / 2, cc.height / 2 + 50, 200, "#ff9900");
    const t = new THREE.CanvasTexture(cc);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const sideMat = new THREE.MeshStandardMaterial({
    map: primeLogoTex,
    emissive: "#ffffff",
    emissiveMap: primeLogoTex,
    emissiveIntensity: 0.25,
    roughness: 0.4
  });
  const sideR = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.13), sideMat);
  sideR.position.set(0.05, 0.075, 0.081);
  grp.add(sideR);
  const sideL = sideR.clone();
  sideL.position.set(0.05, 0.075, -0.081);
  sideL.rotation.y = Math.PI;
  grp.add(sideL);
  box(grp, "truck rear", 0.21, 0.075, 0, 5e-3, 0.13, 0.155, M.metalDark);
  [-0.14, 0, 0.14].forEach((wx) => {
    [-0.07, 0.07].forEach((wz) => {
      const w = cyl(grp, "wheel", wx, 0.024, wz, 0.025, 0.018, M.metalDark, 14);
      w.rotation.x = Math.PI / 2;
    });
  });
  box(grp, "hl L", -0.198, 0.05, 0.045, 5e-3, 0.012, 0.018, mat("#ffeecc", { emissive: "#ffeecc", emissiveIntensity: 0.8 }));
  box(grp, "hl R", -0.198, 0.05, -0.045, 5e-3, 0.012, 0.018, mat("#ffeecc", { emissive: "#ffeecc", emissiveIntensity: 0.8 }));
  return grp;
}
function createCargoPlane(g, x, y, z, rotY = 0, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.rotation.y = rotY;
  grp.scale.setScalar(scale);
  g.add(grp);
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.7, 14),
    mat("#1a3a6a", { metalness: 0.35, roughness: 0.4 })
  );
  body.rotation.z = Math.PI / 2;
  grp.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 14), mat("#1a3a6a"));
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(0.42, 0, 0);
  grp.add(nose);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 14), mat("#1a3a6a"));
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-0.42, 0, 0);
  grp.add(tail);
  box(grp, "plane vert", -0.36, 0.13, 0, 0.05, 0.18, 0.02, mat("#1a3a6a"));
  box(grp, "plane horiz L", -0.38, 0.04, 0.14, 0.1, 0.012, 0.16, mat("#1a3a6a"));
  box(grp, "plane horiz R", -0.38, 0.04, -0.14, 0.1, 0.012, 0.16, mat("#1a3a6a"));
  box(grp, "wing L", 0, -0.02, 0.42, 0.3, 0.015, 0.5, mat("#1a3a6a"));
  box(grp, "wing R", 0, -0.02, -0.42, 0.3, 0.015, 0.5, mat("#1a3a6a"));
  [0.12, -0.12].forEach((ex) => {
    [0.35, 0.55].forEach((ez) => {
      const eng = cyl(grp, "engine", ex, -0.05, ez, 0.025, 0.08, M.metalDark, 14);
      eng.rotation.z = Math.PI / 2;
    });
    [-0.35, -0.55].forEach((ez) => {
      const eng = cyl(grp, "engine", ex, -0.05, ez, 0.025, 0.08, M.metalDark, 14);
      eng.rotation.z = Math.PI / 2;
    });
  });
  box(grp, "plane cockpit", 0.32, 0.05, 0, 0.08, 0.04, 0.13, M.glassBlue);
  const planeLogoTex = makeFacadeTextTexture("amazon", "#1a3a6a", "#ffffff");
  const logoR = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.04), new THREE.MeshStandardMaterial({
    map: planeLogoTex,
    roughness: 0.4,
    emissive: "#ffffff",
    emissiveMap: planeLogoTex,
    emissiveIntensity: 0.3
  }));
  logoR.position.set(0.05, 0.02, 0.082);
  grp.add(logoR);
  const logoL = logoR.clone();
  logoL.position.z = -0.082;
  logoL.rotation.y = Math.PI;
  grp.add(logoL);
  return grp;
}
function createYellowRobotArm(g, x, y, z, baseRot = 0, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.rotation.y = baseRot;
  grp.scale.setScalar(scale);
  g.add(grp);
  cyl(grp, "arm base", 0, 0.04, 0, 0.06, 0.08, M.metalDark, 16);
  cyl(grp, "arm collar", 0, 0.09, 0, 0.045, 0.02, M.yellowRobot, 14);
  const shoulder = new THREE.Group();
  shoulder.position.set(0, 0.1, 0);
  grp.add(shoulder);
  const seg1 = new THREE.Group();
  seg1.rotation.z = -Math.PI / 4;
  shoulder.add(seg1);
  box(seg1, "arm seg1", 0, 0.13, 0, 0.05, 0.28, 0.05, M.yellowRobot);
  cyl(seg1, "elbow", 0, 0.27, 0, 0.035, 0.05, M.metalDark, 12);
  const seg2 = new THREE.Group();
  seg2.position.set(0, 0.27, 0);
  seg2.rotation.z = -Math.PI / 5;
  seg1.add(seg2);
  box(seg2, "arm seg2", 0, 0.09, 0, 0.04, 0.2, 0.04, mat(C.yellowRobotDark, { metalness: 0.35 }));
  box(seg2, "arm wrist", 0, 0.2, 0, 0.05, 0.04, 0.05, M.metalDark);
  box(seg2, "arm tool", 0, 0.235, 0, 0.025, 0.04, 0.025, M.silver);
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(8e-3, 8, 8),
    new THREE.MeshBasicMaterial({ color: "#00a8e1" })
  );
  led.position.set(0, 0.265, 0);
  seg2.add(led);
  return { group: grp, shoulder, seg1, seg2, led };
}
function createEchoSpeaker(g, x, y, z, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.scale.setScalar(scale);
  g.add(grp);
  cyl(grp, "echo body", 0, 0.1, 0, 0.05, 0.2, mat("#1a1a1d", { roughness: 0.65 }), 24);
  const ledRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.05, 5e-3, 6, 24),
    M.alexaBlue
  );
  ledRing.rotation.x = Math.PI / 2;
  ledRing.position.set(0, 0.205, 0);
  grp.add(ledRing);
  cyl(grp, "echo top", 0, 0.215, 0, 0.045, 0.018, mat("#0a0a0a"), 18);
  return { group: grp, ledRing };
}
function createServerRack(g, x, y, z, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.scale.setScalar(scale);
  g.add(grp);
  box(grp, "rack body", 0, 0.18, 0, 0.16, 0.36, 0.12, mat("#1a1a1d", { roughness: 0.5, metalness: 0.35 }));
  box(grp, "rack side L", -0.083, 0.18, 0, 5e-3, 0.36, 0.12, M.metalDark);
  box(grp, "rack side R", 0.083, 0.18, 0, 5e-3, 0.36, 0.12, M.metalDark);
  for (let i = 0; i < 6; i++) {
    const ly = 0.04 + i * 0.058;
    box(grp, `rack mod ${i}`, 0, ly, 0.062, 0.14, 0.045, 5e-3, mat("#0a0a0a"));
    const blink = i % 2 === 0 ? "#00ff88" : "#00a8e1";
    box(
      grp,
      `rack led L ${i}`,
      -0.055,
      ly,
      0.065,
      5e-3,
      8e-3,
      5e-3,
      mat(blink, { emissive: blink, emissiveIntensity: 1.5 })
    );
    box(
      grp,
      `rack led R ${i}`,
      -0.04,
      ly,
      0.065,
      5e-3,
      8e-3,
      5e-3,
      mat("#ffcf3a", { emissive: "#ffcf3a", emissiveIntensity: 1 })
    );
  }
  return grp;
}
function createAWSCloud(g, x, y, z, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.scale.setScalar(scale);
  g.add(grp);
  const main = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 18), M.cloudWhite);
  main.position.set(0, 0, 0);
  grp.add(main);
  const bumps = [
    [-0.28, 0, 0, 0.18],
    [0.28, 0.05, 0, 0.2],
    [-0.14, -0.18, 0, 0.15],
    [0.16, -0.16, 0, 0.16],
    [0, 0.18, 0, 0.18],
    [-0.22, 0.16, 0, 0.15],
    [0.22, 0.18, 0, 0.15]
  ];
  bumps.forEach(([bx, by, bz, br]) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(br, 18, 12), M.cloudWhite);
    s.position.set(bx, by, bz);
    grp.add(s);
  });
  const awsTex = makeAWSCloudTexture();
  texturedPlane(grp, awsTex, 0, 0, 0.35, 0.45, 0.3, 0, 0.3);
  return grp;
}
function createAWSIcon(g, x, y, z, label, color) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  g.add(grp);
  box(grp, `awsIcon ${label}`, 0, 0.05, 0, 0.1, 0.1, 0.02, mat(color, { emissive: color, emissiveIntensity: 0.4 }));
  const tex = makeFacadeTextTexture(label, color, "#ffffff");
  texturedPlane(grp, tex, 0, 0.05, 0.012, 0.09, 0.04, 0, 0.6);
  return grp;
}
function createAmazonHQ(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 2.4, H = 1.4, D = 1.8;
  box(grp, "hq body", 0, H / 2, 0, W, H, D, M.amazonBlack);
  box(grp, "hq roof", 0, H + 0.03, 0, W + 0.05, 0.06, D + 0.05, M.amazonNavy);
  box(grp, "hq base", 0, 0.04, 0, W + 0.1, 0.06, D + 0.1, M.platform);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const sx = -0.9 + i * 0.6;
      const sz = -0.6 + j * 0.45;
      box(grp, `hq solar ${i}_${j}`, sx, H + 0.075, sz, 0.55, 0.012, 0.4, mat("#1a3052", { metalness: 0.55, emissive: "#0a3a8a", emissiveIntensity: 0.15 }));
    }
  }
  box(grp, "hq edge F", 0, H + 0.07, D / 2 + 0.01, W + 0.04, 0.012, 0.012, M.amazonOrangeHot);
  box(grp, "hq edge B", 0, H + 0.07, -D / 2 - 0.01, W + 0.04, 0.012, 0.012, M.amazonOrangeHot);
  box(grp, "hq hvac 1", W / 2 - 0.3, H + 0.13, -D / 2 + 0.3, 0.25, 0.18, 0.18, M.metalDark);
  box(grp, "hq hvac 2", -W / 2 + 0.3, H + 0.11, -D / 2 + 0.3, 0.2, 0.14, 0.16, M.metalDark);
  const amazonLogoTex = makeAmazonLogoTexture("#131921", "#ffffff", "#ff9900");
  texturedPlane(grp, amazonLogoTex, 0, H * 0.62, D / 2 + 0.012, 1.6, 0.6, 0, 1.2);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 10; col++) {
      const wx = -W / 2 + 0.15 + col * 0.24;
      const wy = 0.18 + row * 0.22;
      if (row === 1 || row === 2) {
        box(
          grp,
          `hq win F ${row}_${col}`,
          wx,
          wy,
          D / 2 + 8e-3,
          0.18,
          0.14,
          8e-3,
          row === 1 || row === 2 ? M.glassWarm : M.glass
        );
      }
    }
  }
  box(grp, "hq entrance", 0, 0.18, D / 2 + 8e-3, 0.7, 0.32, 0.012, mat("#0a0a0a", { roughness: 0.3 }));
  box(grp, "hq door L", -0.15, 0.16, D / 2 + 0.015, 0.12, 0.26, 5e-3, M.glassWarm);
  box(grp, "hq door R", 0.15, 0.16, D / 2 + 0.015, 0.12, 0.26, 5e-3, M.glassWarm);
  box(grp, "hq canopy", 0, 0.4, D / 2 + 0.1, 0.95, 0.04, 0.2, M.amazonNavy);
  const dotcomBannerTex = makeAmazonDotComBannerTexture();
  box(grp, "dotcom banner bg", 0, H + 0.85, 0, 2.2, 0.5, 0.05, mat("#0a0a0a", { roughness: 0.4 }));
  texturedPlane(grp, dotcomBannerTex, 0, H + 0.85, 0.03, 2.15, 0.48, 0, 0.5);
  cyl(grp, "banner post L", -0.7, H + 0.45, 0, 0.016, 0.4, M.silver, 8);
  cyl(grp, "banner post R", 0.7, H + 0.45, 0, 0.016, 0.4, M.silver, 8);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const wz = -D / 2 + 0.18 + col * 0.28;
      const wy = 0.18 + row * 0.22;
      if ((row * 7 + col) % 5 !== 0) {
        box(grp, `hq win L ${row}_${col}`, -W / 2 - 5e-3, wy, wz, 5e-3, 0.13, 0.18, M.glassWarm);
        box(
          grp,
          `hq win R ${row}_${col}`,
          W / 2 + 5e-3,
          wy,
          wz,
          5e-3,
          0.13,
          0.18,
          (row * 5 + col) % 4 !== 0 ? M.glassWarm : M.glass
        );
      }
    }
  }
  box(grp, "hq plaza", 0, 0.07, D / 2 + 0.55, 1.8, 0.012, 0.5, M.platform);
  return grp;
}
function createAWSSatellite(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 1.6, H = 0.55, D = 1;
  box(grp, "aws body", 0, H / 2, 0, W, H, D, M.amazonDark);
  box(grp, "aws roof", 0, H + 0.02, 0, W + 0.04, 0.04, D + 0.04, M.amazonNavy);
  box(grp, "aws base", 0, 0.04, 0, W + 0.08, 0.06, D + 0.08, M.platform);
  for (let i = 0; i < 5; i++) {
    const wx = -W / 2 + 0.2 + i * 0.3;
    box(grp, `aws win ${i}`, wx, H * 0.4, D / 2 + 5e-3, 0.22, 0.18, 8e-3, M.glass);
    box(grp, `aws win T ${i}`, wx, H * 0.65, D / 2 + 5e-3, 0.22, 0.12, 8e-3, M.glassBlue);
  }
  createAWSCloud(grp, 0, H + 0.4, 0.1, 0.85);
  for (let i = 0; i < 4; i++) {
    const sx = -W / 2 + 0.25 + i * 0.35;
    createServerRack(grp, sx, 0, D / 2 + 0.25, 0.75);
  }
  box(grp, "aws server pad", 0, 0.05, D / 2 + 0.25, W * 0.85, 0.012, 0.3, mat("#1a1a1d"));
  const services = [
    { label: "EC2", color: "#ff9900", x: -W / 2 + 0.18 },
    { label: "S3", color: "#4caf50", x: -W / 2 + 0.45 },
    { label: "RDS", color: "#3a78ff", x: -W / 2 + 0.72 },
    { label: "Lambda", color: "#ff9900", x: -W / 2 + 0.99 },
    { label: "DynamoDB", color: "#1a4d80", x: -W / 2 + 1.26 },
    { label: "Aurora", color: "#3a78ff", x: -W / 2 + 1.45 }
  ];
  services.forEach((s) => {
    createAWSIcon(grp, s.x, 0.085, D / 2 + 0.55, s.label, s.color);
  });
  rooftopPanel(grp, "1", "AWS \uD074\uB77C\uC6B0\uB4DC", "\uD655\uC7A5 \uAC00\uB2A5\uD55C \uD074\uB77C\uC6B0\uB4DC \uC778\uD504\uB77C\n\uC218\uBC31\uB9CC \uACE0\uAC1D \uC9C0\uC6D0", 0, H + 1, -0.5, 1, 0.36, "#ff9900");
  return grp;
}
function createFulfillment(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 2, H = 0.6, D = 1.2;
  box(grp, "ful body", 0, H / 2, 0, W, H, D, M.amazonDark);
  box(grp, "ful roof", 0, H + 0.02, 0, W + 0.04, 0.04, D + 0.04, M.amazonNavy);
  box(grp, "ful base", 0, 0.04, 0, W + 0.08, 0.06, D + 0.08, M.platform);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      box(grp, `ful solar ${i}_${j}`, -W / 2 + 0.25 + i * 0.4, H + 0.045, -D / 2 + 0.2 + j * 0.4, 0.36, 8e-3, 0.36, mat("#1a3052", { metalness: 0.55 }));
    }
  }
  const fulLabelTex = makeFulfillmentLabelTexture();
  texturedPlane(grp, fulLabelTex, 0, H * 0.7, D / 2 + 0.012, 1.6, 0.18, 0, 1);
  for (let i = 0; i < 5; i++) {
    const dx = -W / 2 + 0.25 + i * 0.4;
    box(grp, `ful dock ${i}`, dx, 0.16, D / 2 + 8e-3, 0.32, 0.3, 0.012, mat("#0a0a0a", { roughness: 0.4 }));
    box(grp, `ful dock light ${i}`, dx, 0.34, D / 2 + 0.014, 0.06, 0.012, 5e-3, M.amazonOrangeHot);
  }
  createPrimeTruck(grp, -0.6, 0.06, D / 2 + 0.3, Math.PI / 2, 1);
  createPrimeTruck(grp, 0, 0.06, D / 2 + 0.3, Math.PI / 2, 1);
  createPrimeTruck(grp, 0.6, 0.06, D / 2 + 0.3, Math.PI / 2, 1);
  box(grp, "ful stripe", 0, 0.05, D / 2 + 0.015, W * 0.95, 0.014, 5e-3, M.amazonOrangeHot);
  rooftopPanel(grp, "2", "\uBB3C\uB958 \xB7 \uD480\uD544\uBA3C\uD2B8", "Prime \uBE60\uB978 \uBC30\uC1A1\n\uAE00\uB85C\uBC8C \uD480\uD544\uBA3C\uD2B8 \uC13C\uD130", 0, H + 0.85, 0, 1.05, 0.36, "#00a8e1");
  return grp;
}
function createMarketplace(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 1.8, H = 0.55, D = 1;
  box(grp, "mp body", 0, H / 2, 0, W, H, D, M.amazonDark);
  box(grp, "mp roof", 0, H + 0.02, 0, W + 0.04, 0.04, D + 0.04, M.amazonNavy);
  box(grp, "mp base", 0, 0.04, 0, W + 0.08, 0.06, D + 0.08, M.platform);
  const bestTex = makeBestSellerTexture();
  box(grp, "mp screen frame", 0, H * 0.55, D / 2 + 5e-3, W - 0.2, H * 0.7, 0.018, M.metalDark);
  texturedPlane(grp, bestTex, 0, H * 0.55, D / 2 + 0.015, W - 0.25, H * 0.65, 0, 0.6);
  createPackageBox(grp, -W / 2 + 0.2, 0, D / 2 + 0.25, 1.2, 0);
  createPackageBox(grp, -W / 2 + 0.35, 0.12, D / 2 + 0.25, 1, Math.PI / 6);
  createPackageBox(grp, -W / 2 + 0.55, 0, D / 2 + 0.3, 1.3, -Math.PI / 8);
  createPackageBox(grp, -W / 2 + 0.75, 0.12, D / 2 + 0.25, 1, Math.PI / 5);
  createPackageBox(grp, -W / 2 + 0.15, 0, D / 2 + 0.45, 1.1, Math.PI / 4);
  const robotArm = createYellowRobotArm(grp, W / 2 - 0.3, 0, D / 2 + 0.35, -Math.PI / 5, 1);
  box(grp, "mp conveyor", W / 2 - 0.5, 0.075, D / 2 + 0.55, 0.5, 0.025, 0.18, mat("#2a2a30"));
  createPackageBox(grp, W / 2 - 0.55, 0.09, D / 2 + 0.55, 0.7, 0);
  createPackageBox(grp, W / 2 - 0.4, 0.09, D / 2 + 0.55, 0.7, Math.PI / 8);
  box(grp, "mp worker", W / 2 - 0.15, 0.07, D / 2 + 0.5, 0.04, 0.08, 0.025, mat("#ffaf3a", { emissive: "#ffaf3a", emissiveIntensity: 0.4 }));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), mat("#ffd5b0"));
  head.position.set(W / 2 - 0.15, 0.13, D / 2 + 0.5);
  grp.add(head);
  rooftopPanel(grp, "3", "\uB9C8\uCF13\uD50C\uB808\uC774\uC2A4", "\uC218\uBC31\uB9CC \uC140\uB7EC\n\uC218\uC5B5 \uAC1C \uC0C1\uD488", 0, H + 0.85, 0, 1, 0.36, "#f5c518");
  return { group: grp, robotArm };
}
function createDigitalContent(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 2, H = 0.5, D = 1;
  box(grp, "dc body", 0, H / 2, 0, W, H, D, M.amazonDark);
  box(grp, "dc roof", 0, H + 0.02, 0, W + 0.04, 0.04, D + 0.04, M.amazonNavy);
  box(grp, "dc base", 0, 0.04, 0, W + 0.08, 0.06, D + 0.08, M.platform);
  const pvTex = makePrimeVideoTexture();
  box(grp, "dc pv frame", -0.65, H * 0.55, D / 2 + 5e-3, 0.65, 0.36, 0.018, M.metalDark);
  texturedPlane(grp, pvTex, -0.65, H * 0.55, D / 2 + 0.015, 0.6, 0.34, 0, 0.55);
  const klTex = makeKindleTexture();
  box(grp, "dc kl frame", 0, H * 0.55, D / 2 + 5e-3, 0.3, 0.42, 0.018, M.metalDark);
  texturedPlane(grp, klTex, 0, H * 0.55, D / 2 + 0.015, 0.28, 0.4, 0, 0.55);
  const amTex = makeAmazonMusicTexture();
  box(grp, "dc am frame", 0.5, H * 0.55, D / 2 + 5e-3, 0.3, 0.42, 0.018, M.metalDark);
  texturedPlane(grp, amTex, 0.5, H * 0.55, D / 2 + 0.015, 0.28, 0.4, 0, 0.55);
  rooftopPanel(grp, "4", "\uB514\uC9C0\uD138 \uCF58\uD150\uCE20", "Prime Video \xB7 Music\nKindle \xB7 Audible", 0, H + 0.85, 0, 1.05, 0.36, "#d6336c");
  return grp;
}
function createAdvertising(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 1.6, H = 0.5, D = 0.9;
  box(grp, "ad body", 0, H / 2, 0, W, H, D, M.amazonDark);
  box(grp, "ad roof", 0, H + 0.02, 0, W + 0.04, 0.04, D + 0.04, M.amazonNavy);
  box(grp, "ad base", 0, 0.04, 0, W + 0.08, 0.06, D + 0.08, M.platform);
  const adsTex = makeAmazonAdsTexture();
  box(grp, "ad frame", 0, H * 0.55, D / 2 + 5e-3, W - 0.2, H * 0.75, 0.018, M.metalDark);
  texturedPlane(grp, adsTex, 0, H * 0.55, D / 2 + 0.015, W - 0.25, H * 0.7, 0, 0.6);
  box(grp, "ad desk", -0.4, 0.085, D / 2 + 0.35, 0.4, 0.025, 0.16, mat("#7a5a3a"));
  box(grp, "ad chair 1", -0.5, 0.075, D / 2 + 0.5, 0.05, 0.05, 0.05, mat("#1a1a1d"));
  box(grp, "ad chair 2", -0.3, 0.075, D / 2 + 0.5, 0.05, 0.05, 0.05, mat("#1a1a1d"));
  box(grp, "ad person 1", -0.5, 0.115, D / 2 + 0.5, 0.04, 0.07, 0.025, mat("#3a78ff"));
  box(grp, "ad person 2", -0.3, 0.115, D / 2 + 0.5, 0.04, 0.07, 0.025, mat("#34c759"));
  box(grp, "ad mini board", 0.4, 0.18, D / 2 + 0.35, 0.32, 0.18, 0.018, M.amazonBlack);
  const miniAdsTex = makeFacadeTextTexture("amazon ads", "#0a0a0a", "#ff9900");
  texturedPlane(grp, miniAdsTex, 0.4, 0.18, D / 2 + 0.345, 0.28, 0.05, 0, 0.5);
  cyl(grp, "ad mini post", 0.4, 0.05, D / 2 + 0.35, 0.014, 0.1, M.metal, 8);
  rooftopPanel(grp, "5", "\uAD11\uACE0", "\uAD00\uB828\uC131 \uB192\uC740 \uAD11\uACE0\n\uCE21\uC815 \uAC00\uB2A5\uD55C \uACB0\uACFC", 0, H + 0.85, 0, 1, 0.36, "#4caf50");
  return grp;
}
function createDevicesServices(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 1.8, H = 0.45, D = 0.9;
  box(grp, "ds body", 0, H / 2, 0, W, H, D, M.amazonDark);
  box(grp, "ds roof", 0, H + 0.02, 0, W + 0.04, 0.04, D + 0.04, M.amazonNavy);
  box(grp, "ds base", 0, 0.04, 0, W + 0.08, 0.06, D + 0.08, M.platform);
  box(grp, "ds alexa stripe", 0, H + 0.025, D / 2, W * 0.5, 0.015, 0.05, mat("#1ba1e2"));
  const alexaLabelTex = makeFacadeTextTexture("alexa", "#1ba1e2", "#ffffff");
  texturedPlane(grp, alexaLabelTex, 0, H + 0.045, D / 2 + 5e-3, 0.5, 0.07, 0, 0.6);
  const echo = createEchoSpeaker(grp, -W / 2 + 0.25, H + 0.05, 0, 1.2);
  box(grp, "ds firetv stick", 0, H + 0.045, 0, 0.06, 0.015, 0.16, mat("#1a1a1d", { roughness: 0.4 }));
  const fireTex = makeFireTVTexture();
  texturedPlane(grp, fireTex, 0, H + 0.05, 1e-3, 0.05, 0.14, 0, 0.6);
  box(grp, "ds show body", W / 2 - 0.3, H + 0.1, 0, 0.32, 0.2, 0.08, mat("#1a1a1d"));
  const showTex = makeEchoShowTexture();
  texturedPlane(grp, showTex, W / 2 - 0.3, H + 0.12, 0.041, 0.28, 0.16, 0, 0.7);
  box(grp, "ds front glass", 0, H * 0.5, D / 2 + 5e-3, W - 0.3, H - 0.1, 0.018, M.glass);
  for (let i = 0; i < 5; i++) {
    const dx = -W / 2 + 0.25 + i * 0.32;
    box(grp, `ds mini dev ${i}`, dx, 0.13, D / 2 + 5e-3, 0.08, 0.06, 0.04, mat("#0a0a0a"));
  }
  rooftopPanel(grp, "6", "\uB514\uBC14\uC774\uC2A4 \xB7 \uC11C\uBE44\uC2A4", "Alexa \xB7 Echo \xB7 Fire TV\n\uD601\uC2E0\uC801 \uB514\uBC14\uC774\uC2A4 \uACBD\uD5D8", 0, H + 1, -0.4, 1.05, 0.36, "#1ba1e2");
  return { group: grp, echo };
}
function buildAmazonCampusDiorama() {
  const g = new THREE.Group();
  box(g, "plinth", 0, -0.13, 0, gx(7.4), 0.26, gx(6), M.base);
  box(g, "platform", 0, 0.02, 0, gx(6.9), 0.12, gx(5.6), M.platform);
  box(g, "road x", 0, 0.084, 0.4, gx(6.5), 0.012, gx(0.45), M.road);
  box(g, "road z", 0, 0.084, 0, gx(0.45), 0.012, gx(5), M.road);
  for (let i = -4; i <= 4; i++) {
    box(g, `lane mark x ${i}`, i * 0.5, 0.087, 0.4, 0.18, 5e-3, 0.02, mat("#ffffff"));
  }
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    box(g, `lane mark z ${i}`, 0, 0.087, i * 0.7, 0.02, 5e-3, 0.18, mat("#ffffff"));
  }
  for (let i = 0; i < 6; i++) {
    box(g, `crosswalk ${i}`, -0.25 + i * 0.1, 0.087, 0.4, 0.04, 5e-3, 0.4, mat("#ffffff"));
  }
  createAmazonHQ(g, 0, 0.08, -1.6);
  createAWSSatellite(g, -3, 0.08, -1.3);
  createFulfillment(g, 2.9, 0.08, -1.3);
  createMarketplace(g, 3, 0.08, 0.7);
  createDigitalContent(g, -2.5, 0.08, 1.4);
  createAdvertising(g, 0, 0.08, 1.5);
  createDevicesServices(g, 2.5, 0.08, 2.2);
  const cargoPlane = createCargoPlane(g, 3.8, 0.9, -2.3, -Math.PI / 4, 1);
  const treeSpots = [
    [-3.8, -2.6],
    [3.8, -2.6],
    [-3.8, 2.6],
    [3.8, 2.6],
    [-3.8, 0],
    [3.8, 0],
    [-3.8, -1.2],
    [3.8, -1.2],
    [-2, 2.8],
    [0, 2.8],
    [2, 2.8],
    [0, -2.85],
    [-1.5, -0.4],
    [1.5, -0.4]
  ];
  treeSpots.forEach(([x, z]) => tree(g, x, z, 0.42));
  const lampSpots = [
    [-1.5, 1],
    [1.5, 1],
    [-1.5, -0.5],
    [1.5, -0.5],
    [-3.3, 1.8],
    [3.3, 1.8]
  ];
  lampSpots.forEach(([lx, lz]) => {
    cyl(g, `lamp post`, lx, 0.18, lz, 0.018, 0.32, M.metalDark, 8);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 10),
      mat("#fff2c8", { emissive: "#ffaf3a", emissiveIntensity: 0.8 })
    );
    lamp.position.set(lx, 0.36, lz);
    g.add(lamp);
  });
  const movingTrucks = [];
  for (let i = 0; i < 3; i++) {
    const truck = createPrimeTruck(g, -2.5 + i * 2.5, 0.06, 0.4, Math.PI / 2, 1);
    movingTrucks.push({ group: truck, baseX: -2.5 + i * 2.5 });
  }
  const dataPaths = [];
  const satellites = [
    { name: "aws", x: -3, y: 0.7, z: -1.3 },
    { name: "fulfillment", x: 2.9, y: 0.7, z: -1.3 },
    { name: "marketplace", x: 3, y: 0.7, z: 0.7 },
    { name: "digital", x: -2.5, y: 0.6, z: 1.4 },
    { name: "advertising", x: 0, y: 0.6, z: 1.5 },
    { name: "devices", x: 2.5, y: 0.6, z: 2.2 }
  ];
  const satSplashLights = [];
  satellites.forEach((sat, idx) => {
    const start = new THREE.Vector3(0, 1.5, -1);
    const mid = new THREE.Vector3((start.x + sat.x) / 2, 2, (start.z + sat.z) / 2);
    const end = new THREE.Vector3(sat.x, sat.y, sat.z);
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const beads = [];
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), M.dataBead.clone());
      const bLight = new THREE.PointLight(C.hotData, 0.15, 0.5);
      b.add(bLight);
      g.add(b);
      beads.push({ mesh: b, light: bLight, offset: i / 4 });
    }
    const splash = new THREE.PointLight(C.hotData, 0, 1.4);
    splash.position.set(sat.x, sat.y + 0.1, sat.z);
    g.add(splash);
    satSplashLights.push(splash);
    dataPaths.push({ curve, beads, speed: 0.06 + idx * 8e-3 });
  });
  const moneyPaths = [];
  satellites.forEach((sat, idx) => {
    const start = new THREE.Vector3(sat.x, sat.y + 0.3, sat.z);
    const mid = new THREE.Vector3(sat.x / 2, 2.5, (sat.z - 1.6) / 2);
    const end = new THREE.Vector3(0, 2.4, -1.6);
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const coins = [];
    for (let i = 0; i < 3; i++) {
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.014, 16),
        M.goldCoin.clone()
      );
      g.add(coin);
      coins.push({ mesh: coin, offset: i / 3 });
    }
    moneyPaths.push({ curve, coins, speed: 0.045 + idx * 4e-3 });
  });
  const goldGlow = new THREE.PointLight("#ffd700", 0.5, 3);
  goldGlow.position.set(0, 2.4, -1.6);
  g.add(goldGlow);
  const hqGlow = new THREE.PointLight("#ffaf3a", 0.8, 4);
  hqGlow.position.set(0, 1, -1);
  g.add(hqGlow);
  const orangeGlow = new THREE.PointLight("#ff9900", 0.5, 3);
  orangeGlow.position.set(0, 1.8, 0.5);
  g.add(orangeGlow);
  const cloudGlow = new THREE.PointLight("#ffffff", 0.4, 2.5);
  cloudGlow.position.set(-3, 1, -1.3);
  g.add(cloudGlow);
  g.userData = {
    marketplaceArm: marketplace.robotArm,
    echoDevice: devices.echo,
    cargoPlane,
    movingTrucks,
    dataPaths,
    satSplashLights,
    moneyPaths,
    goldGlow
  };
  return g;
}
function createAmazon() {
  const root = buildAmazonCampusDiorama();
  const SPEED = 0.4;
  root.userData.tick = (time) => {
    const t = time * SPEED;
    const tRaw = time;
    const u = root.userData;
    if (u.marketplaceArm) {
      u.marketplaceArm.shoulder.rotation.y = Math.sin(tRaw * 0.7) * 0.4;
      u.marketplaceArm.seg1.rotation.z = -Math.PI / 4 + Math.sin(tRaw * 1) * 0.25;
      u.marketplaceArm.seg2.rotation.z = -Math.PI / 5 + Math.cos(tRaw * 0.9) * 0.3;
      u.marketplaceArm.led.material.color.setHSL(
        0.55,
        1,
        0.5 + 0.3 * Math.sin(tRaw * 4)
      );
    }
    if (u.echoDevice?.ledRing) {
      u.echoDevice.ledRing.material.emissiveIntensity = 0.8 + 0.5 * Math.sin(tRaw * 2);
    }
    if (u.cargoPlane) {
      u.cargoPlane.position.x = 3.8 + Math.sin(tRaw * 0.2) * 0.3;
      u.cargoPlane.position.z = -2.3 + Math.cos(tRaw * 0.2) * 0.15;
      u.cargoPlane.position.y = 0.9 + Math.sin(tRaw * 0.4) * 0.05;
    }
    u.movingTrucks.forEach((tr, idx) => {
      const speed = 0.25 + idx * 0.05;
      const pos = (tRaw * speed + idx * 0.33) % 1;
      tr.group.position.x = -3.8 + pos * 7.6;
    });
    u.dataPaths.forEach((path, pIdx) => {
      path.beads.forEach((b, idx) => {
        const progress = (tRaw * path.speed + b.offset) % 1;
        b.mesh.position.copy(path.curve.getPoint(progress));
        const pulse = 1.4 + 0.5 * Math.sin(t * 3 + idx);
        b.mesh.material.emissiveIntensity = pulse;
        b.light.intensity = 0.14 + 0.08 * Math.sin(t * 3.5 + idx);
        if (progress > 0.92) {
          u.satSplashLights[pIdx].intensity = 1.4 * (progress - 0.92) / 0.08;
        }
      });
      u.satSplashLights[pIdx].intensity *= 0.94;
    });
    u.moneyPaths.forEach((path) => {
      path.coins.forEach((c, idx) => {
        const progress = (tRaw * path.speed + c.offset) % 1;
        c.mesh.position.copy(path.curve.getPoint(progress));
        c.mesh.rotation.x = Math.PI / 2;
        c.mesh.rotation.y = tRaw * 4 + idx;
        c.mesh.material.emissiveIntensity = 1.4 + 0.4 * Math.sin(t * 2.5 + idx);
      });
    });
    u.goldGlow.intensity = 0.4 + 0.25 * Math.sin(t * 1.5);
    root.rotation.y = Math.sin(t * 0.15) * 8e-3;
  };
  return root;
}
function createAmazonWarehouse() {
  return createAmazon();
}
export {
  createAmazon,
  createAmazonWarehouse
};
