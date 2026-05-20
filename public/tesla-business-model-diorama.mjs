import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const GROUND_XZ = 1.25;
const gx = (n) => n * GROUND_XZ;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#2a3d58');
scene.fog = new THREE.Fog('#2a3d58', 16, 34);

const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 100);
camera.position.set(8, 6.5, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.8, 0.2);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 5;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI * 0.49;

// ===== Palette (Tesla tone: black, red, silver, glass) =====
const C = {
  teslaRed: '#e31937', teslaRedDark: '#b8001e',
  black: '#2a2e36', darkGrey: '#4a5260',
  metalDark: '#6a727c', metal: '#a8acb4', silver: '#e4e8ee',
  glass: '#72b8ff', glassLight: '#c8e8ff', glassDeep: '#4a90d8',
  road: '#4a5460', base: '#1e2838', platform: '#d4dae4',
  grass: '#3a9a58', grassLight: '#52b872',
  warm: '#fff6dc', amber: '#ffc85a',
  solar: '#2a5080', solarHot: '#1a5aaa',
  screenBlue: '#4a88ff', screenCyan: '#5ac8f8', screenAI: '#6a5ad9',
  hotData: '#ff92a8', goldGlow: '#ffe080'
};

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: o.roughness ?? 0.6,
  metalness: o.metalness ?? 0.08,
  transparent: o.transparent ?? false,
  opacity: o.opacity ?? 1,
  emissive: o.emissive ?? '#000000',
  emissiveIntensity: o.emissiveIntensity ?? 0,
  side: o.side ?? THREE.FrontSide
});

const M = {
  teslaRed: mat(C.teslaRed, { roughness: .35, metalness: .35, emissive: '#5a0d18', emissiveIntensity: .15 }),
  teslaRedHot: mat(C.teslaRed, { emissive: C.teslaRed, emissiveIntensity: 1.2, roughness: .25 }),
  black: mat(C.black, { roughness: .55, metalness: .15 }),
  darkGrey: mat(C.darkGrey, { roughness: .42, metalness: .18 }),
  metalDark: mat(C.metalDark, { roughness: .32, metalness: .55 }),
  metal: mat(C.metal, { roughness: .3, metalness: .5 }),
  silver: mat(C.silver, { roughness: .28, metalness: .48 }),
  white: mat('#fafafa', { roughness: .35, metalness: .1 }),
  glass: mat(C.glass, { roughness: .08, metalness: .12, transparent: true, opacity: .52, emissive: '#3a88e8', emissiveIntensity: .22 }),
  glassDeep: mat(C.glassDeep, { roughness: .1, metalness: .12, transparent: true, opacity: .62, emissive: '#2a68c8', emissiveIntensity: .18 }),
  glassLight: mat(C.glassLight, { roughness: .06, metalness: .08, transparent: true, opacity: .4 }),
  road: mat(C.road, { roughness: .78 }),
  base: mat(C.base, { roughness: .5 }),
  platform: mat(C.platform, { roughness: .72 }),
  grass: mat(C.grass, { roughness: .82 }),
  grassLight: mat(C.grassLight, { roughness: .78 }),
  warmWindow: mat(C.warm, { roughness: .32, emissive: '#ffc85a', emissiveIntensity: .85 }),
  amberLight: mat(C.amber, { emissive: C.amber, emissiveIntensity: 1.0, roughness: .3 }),
  green: mat('#2f7d42', { roughness: .8 }),
  bark: mat('#7a4b2a', { roughness: .85 }),
  solar: mat(C.solar, { roughness: .22, metalness: .55, emissive: C.solarHot, emissiveIntensity: .32 }),
  solarGrid: mat('#2a4880', { roughness: .3, metalness: .5 }),
  screen: mat(C.screenBlue, { emissive: C.screenBlue, emissiveIntensity: 1.2, roughness: .15 }),
  screenAI: mat(C.screenAI, { emissive: C.screenAI, emissiveIntensity: 1.0, roughness: .15 }),
  dataBead: new THREE.MeshStandardMaterial({
    color: C.hotData, emissive: C.hotData, emissiveIntensity: 2.0, roughness: .25
  }),
  goldCoin: new THREE.MeshStandardMaterial({
    color: '#ffd700', emissive: '#ffaa00', emissiveIntensity: 1.6,
    roughness: .25, metalness: .85
  })
};

function box(g, name, x, y, z, sx, sy, sz, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
function cyl(g, name, x, y, z, r, h, material, radial = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radial), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
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

function drawTeslaT(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  const s = size;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy - s * 0.5);
  ctx.lineTo(cx + s * 0.42, cy - s * 0.5);
  ctx.lineTo(cx + s * 0.32, cy - s * 0.36);
  ctx.lineTo(cx - s * 0.32, cy - s * 0.36);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - s * 0.28, cy - s * 0.32, s * 0.56, s * 0.06);
  ctx.fillRect(cx - s * 0.08, cy - s * 0.22, s * 0.16, s * 0.72);
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.18, cy - s * 0.22);
  ctx.lineTo(cx - s * 0.08, cy - s * 0.22);
  ctx.lineTo(cx - s * 0.08, cy - s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.18, cy - s * 0.22);
  ctx.lineTo(cx + s * 0.08, cy - s * 0.22);
  ctx.lineTo(cx + s * 0.08, cy - s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function makeTeslaLogoTexture(bg = '#0a0a0a', fg = '#e31937', withText = true) {
  const c = document.createElement('canvas');
  c.width = withText ? 1024 : 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  if (withText) {
    drawTeslaT(ctx, 200, c.height/2, 280, fg);
    ctx.fillStyle = fg;
    ctx.font = 'bold 180px "Helvetica Neue", Arial';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('T E S L A', 380, c.height/2);
  } else {
    drawTeslaT(ctx, c.width/2, c.height/2, 360, fg);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeLabelPanelTexture(num, korTitle, korSubtitle, accentColor = '#e31937') {
  const c = document.createElement('canvas');
  c.width = 768; c.height = 280;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, 6, 6, c.width-12, c.height-12, 32);
  ctx.fill();
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 3;
  roundRect(ctx, 6, 6, c.width-12, c.height-12, 32);
  ctx.stroke();
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(90, 85, 42, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px "Helvetica Neue", Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(num, 90, 88);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px "Malgun Gothic", Arial';
  ctx.textAlign = 'left';
  ctx.fillText(korTitle, 160, 85);
  if (korSubtitle) {
    ctx.fillStyle = '#c4c4c8';
    ctx.font = '34px "Malgun Gothic", Arial';
    korSubtitle.split('\n').forEach((line, i) => {
      ctx.fillText(line, 50, 175 + i * 44);
    });
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeFacadeTextTexture(text, bg = '#0a0a0a', fg = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = fg;
  ctx.font = 'bold 72px "Helvetica Neue", Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width/2, c.height/2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeFSDDisplayTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, '#0a1828');
  grad.addColorStop(1, '#1a3052');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#4a8eda';
  ctx.beginPath();
  ctx.arc(180, 220, 75, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px "Helvetica Neue", Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('AI', 180, 230);
  ctx.fillStyle = 'rgba(227, 25, 55, 0.85)';
  roundRect(ctx, 320, 170, 220, 110, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 60px "Helvetica Neue", Arial';
  ctx.fillText('FSD', 430, 230);
  ctx.fillStyle = 'rgba(74, 142, 218, 0.85)';
  roundRect(ctx, 600, 170, 240, 110, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px "Helvetica Neue", Arial';
  ctx.fillText('Dojo', 720, 230);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeTeslaAppTexture() {
  const c = document.createElement('canvas');
  c.width = 384; c.height = 768;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0a0a0a';
  roundRect(ctx, 0, 0, c.width, c.height, 30);
  ctx.fill();
  drawTeslaT(ctx, 80, 95, 50, '#e31937');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Helvetica Neue", Arial';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('TESLA APP', 120, 95);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function rooftopPanel(g, num, title, subtitle, x, y, z, w = 0.95, h = 0.35, accent = '#e31937') {
  const tex = makeLabelPanelTexture(num, title, subtitle, accent);
  const m = new THREE.MeshStandardMaterial({
    map: tex, side: THREE.DoubleSide, roughness: .4,
    emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: .35
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.position.set(x, y, z);
  g.add(mesh);
  cyl(g, `panel post ${num}`, x, y - h/2 - 0.16, z, 0.014, 0.32, M.silver, 8);
  return mesh;
}

function texturedPlane(g, tex, x, y, z, w, h, rotY = 0, emissive = 0.3) {
  const m = new THREE.MeshStandardMaterial({
    map: tex, side: THREE.DoubleSide, roughness: .4,
    emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: emissive
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  g.add(mesh);
  return mesh;
}

function tree(g, x, z, s = .5) {
  cyl(g, 'tree trunk', x, .23 * s / .5, z, .035, .38 * s / .5, M.bark, 10);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(.18 * s / .5, 16, 12), M.green);
  crown.position.set(x, .52 * s / .5, z);
  crown.castShadow = true; crown.receiveShadow = true;
  g.add(crown);
}

function createTeslaCar(g, x, y, z, color = '#e8e8e8', rotY = 0, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.rotation.y = rotY;
  grp.scale.setScalar(scale);
  g.add(grp);
  const carMat = mat(color, { metalness: .55, roughness: .25 });
  box(grp, 'car lower', 0, 0.035, 0, 0.28, 0.05, 0.13, carMat);
  box(grp, 'car cabin', 0, 0.085, 0, 0.22, 0.05, 0.12, carMat);
  box(grp, 'car glass', 0, 0.085, 0, 0.21, 0.045, 0.122, M.glassDeep);
  [[-0.1, 0.062], [0.1, 0.062], [-0.1, -0.062], [0.1, -0.062]].forEach(([bx, bz]) => {
    const w = cyl(grp, 'wheel', bx, 0.022, bz, 0.022, 0.025, M.metalDark, 14);
    w.rotation.x = Math.PI / 2;
  });
  return grp;
}

function createRobotArm(g, x, y, z, baseRot = 0, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.rotation.y = baseRot;
  grp.scale.setScalar(scale);
  g.add(grp);
  cyl(grp, 'arm base', 0, 0.04, 0, 0.06, 0.08, M.darkGrey, 16);
  const shoulder = new THREE.Group();
  shoulder.position.set(0, 0.1, 0);
  grp.add(shoulder);
  const seg1 = new THREE.Group();
  seg1.rotation.z = -Math.PI / 4;
  shoulder.add(seg1);
  box(seg1, 'arm seg1', 0, 0.13, 0, 0.05, 0.28, 0.05, M.teslaRed);
  const seg2 = new THREE.Group();
  seg2.position.set(0, 0.27, 0);
  seg2.rotation.z = -Math.PI / 5;
  seg1.add(seg2);
  box(seg2, 'arm seg2', 0, 0.09, 0, 0.04, 0.2, 0.04, mat('#cc0a26', { metalness: .35 }));
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.008, 8, 8),
    new THREE.MeshBasicMaterial({ color: '#ffcf3a' })
  );
  led.position.set(0, 0.265, 0);
  seg2.add(led);
  return { group: grp, shoulder, seg1, seg2, led };
}
function createMegapack(g, x, y, z, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z); grp.scale.setScalar(scale);
  g.add(grp);
  box(grp, 'mp body', 0, 0.14, 0, 0.22, 0.28, 0.42, M.silver);
  for (let i = 0; i < 3; i++) {
    box(grp, `mp stripe ${i}`, 0, 0.07 + i*0.08, 0, 0.222, 0.005, 0.42, M.metalDark);
  }
  return grp;
}

function createSupercharger(g, x, y, z, rotY = 0, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z); grp.rotation.y = rotY; grp.scale.setScalar(scale);
  g.add(grp);
  box(grp, 'sc body', 0, 0.18, 0, 0.09, 0.36, 0.05, M.white);
  box(grp, 'sc red top', 0, 0.34, 0.026, 0.09, 0.04, 0.005, M.teslaRedHot);
  box(grp, 'sc base', 0, 0.02, 0, 0.11, 0.04, 0.08, M.platform);
  return grp;
}

function createSuperchargerSign(g, x, y, z, rotY = 0, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z); grp.rotation.y = rotY; grp.scale.setScalar(scale);
  g.add(grp);
  cyl(grp, 'sign post', 0, 0.18, 0, 0.025, 0.36, M.metalDark, 12);
  box(grp, 'sign box', 0, 0.42, 0, 0.34, 0.42, 0.05, M.teslaRed);
  const signTex = (() => {
    const c = document.createElement('canvas');
    c.width = 384; c.height = 480;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#e31937';
    ctx.fillRect(0, 0, c.width, c.height);
    drawTeslaT(ctx, c.width/2, 130, 180, '#ffffff');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Helvetica Neue", Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('T E S L A', c.width/2, 260);
    ctx.font = 'bold 28px "Helvetica Neue", Arial';
    ctx.fillText('SUPERCHARGER', c.width/2, 330);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.4),
    new THREE.MeshStandardMaterial({
      map: signTex, side: THREE.DoubleSide,
      emissive: '#ffffff', emissiveMap: signTex, emissiveIntensity: 0.45, roughness: .4
    })
  );
  front.position.set(0, 0.42, 0.026);
  grp.add(front);
  return grp;
}

function createSatelliteDish(g, x, y, z, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z); grp.scale.setScalar(scale);
  g.add(grp);
  cyl(grp, 'dish post', 0, 0.15, 0, 0.025, 0.3, M.metalDark, 12);
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 12, 0, Math.PI*2, 0, Math.PI / 2.2),
    M.silver
  );
  dish.rotation.x = Math.PI;
  dish.position.set(0, 0.36, 0);
  grp.add(dish);
  return grp;
}

function createStarlinkSatellite(g, x, y, z, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z); grp.scale.setScalar(scale);
  g.add(grp);
  box(grp, 'sl body', 0, 0, 0, 0.06, 0.04, 0.12, M.silver);
  box(grp, 'sl panel L', -0.14, 0, 0, 0.18, 0.005, 0.1, M.solar);
  box(grp, 'sl panel R', 0.14, 0, 0, 0.18, 0.005, 0.1, M.solar);
  return grp;
}

function createTeslaAppDisplay(g, x, y, z, scale = 1) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z); grp.scale.setScalar(scale);
  g.add(grp);
  box(grp, 'app body', 0, 0.32, 0, 0.32, 0.62, 0.025, mat('#1a1a1d', { metalness: .6, roughness: .25 }));
  const appTex = makeTeslaAppTexture();
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.6),
    new THREE.MeshStandardMaterial({
      map: appTex, emissive: '#ffffff', emissiveMap: appTex, emissiveIntensity: 0.55, roughness: 0.15
    })
  );
  screen.position.set(0, 0.32, 0.013);
  grp.add(screen);
  box(grp, 'app stand base', 0, 0.025, 0, 0.18, 0.05, 0.12, M.platform);
  return { group: grp, screen };
}

function createTeslaFactory(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 3.5, H = 0.85, D = 1.6;
  box(grp, 'fac body', 0, H/2, 0, W, H, D, M.darkGrey);
  box(grp, 'fac roof', 0, H + 0.025, 0, W + 0.05, 0.05, D + 0.05, M.metalDark);
  box(grp, 'fac base', 0, 0.04, 0, W + 0.1, 0.06, D + 0.1, M.platform);
  const showW = 1.0;
  const showCx = -W/2 + showW/2 + 0.1;
  box(grp, 'show front glass', showCx, 0.45, D/2 + 0.005, showW - 0.1, 0.7, 0.02, M.glass);
  const showLabelTex = makeFacadeTextTexture('SHOWROOM', '#0a0a0a', '#ffffff');
  texturedPlane(grp, showLabelTex, showCx, 0.86, D/2 + 0.015, showW - 0.15, 0.045, 0, 0.4);
  createTeslaCar(grp, showCx - 0.3, 0.07, 0.45, '#f4f4f4', Math.PI / 6, 0.9);
  createTeslaCar(grp, showCx, 0.07, 0.4, '#e31937', -Math.PI / 8, 0.9);
  createTeslaCar(grp, showCx + 0.3, 0.07, 0.45, '#1c1c1e', Math.PI / 4, 0.9);
  const lineW = 2.5;
  const lineCx = -W/2 + showW + lineW/2 + 0.1;
  box(grp, 'fac red wall', lineCx + lineW/2 - 0.6, H/2 + 0.05, D/2 + 0.012, 1.0, 0.7, 0.02, M.teslaRed);
  const logoTex = makeTeslaLogoTexture('#e31937', '#ffffff', true);
  texturedPlane(grp, logoTex, lineCx + lineW/2 - 0.6, H/2 + 0.05, D/2 + 0.024, 0.95, 0.45, 0, 0.5);
  const openW = 1.5;
  const openCx = lineCx - lineW/2 + openW/2 + 0.05;
  box(grp, 'line conveyor', openCx, 0.07, 0.3, 1.4, 0.04, 0.4, M.metalDark);
  const carColors = ['#e8e8e8', '#1c1c1e', '#e31937', '#aeb4bd'];
  for (let i = 0; i < 4; i++) {
    createTeslaCar(grp, openCx - 0.5 + i * 0.35, 0.105, 0.3, carColors[i], Math.PI/2, 0.85);
  }
  const robotArms = [];
  for (let i = 0; i < 2; i++) {
    const armX = openCx - 0.4 + i * 0.6;
    robotArms.push(createRobotArm(grp, armX, 0.1, 0.62, 0, 0.9));
    robotArms.push(createRobotArm(grp, armX, 0.1, 0.0, Math.PI, 0.9));
  }
  rooftopPanel(grp, '2', '차량 설계·생산', '전기차 설계·제조·생산', 0, H + 0.55, 0, 1.0, 0.36);
  return { group: grp, robotArms };
}
function createAISoftware(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 1.1, H = 0.55, D = 0.75;
  box(grp, 'ai body', 0, H/2, 0, W, H, D, M.darkGrey);
  box(grp, 'ai roof', 0, H + 0.02, 0, W + 0.04, 0.04, D + 0.04, M.metalDark);
  box(grp, 'ai base', 0, 0.04, 0, W + 0.08, 0.06, D + 0.08, M.platform);
  const fsdTex = makeFSDDisplayTexture();
  texturedPlane(grp, fsdTex, 0, H/2 + 0.05, D/2 + 0.005, W - 0.15, H - 0.15, 0, 0.55);
  const facadeTex = makeFacadeTextTexture('AI & SOFTWARE', '#0a0a0a', '#4a8eda');
  texturedPlane(grp, facadeTex, 0, 0.07, D/2 + 0.008, W - 0.2, 0.06, 0, 0.5);
  rooftopPanel(grp, '3', '소프트웨어 · AI', 'AI · FSD · 자율주행\nDojo 슈퍼컴퓨팅', 0, H + 0.5, 0, 0.95, 0.34, '#4a8eda');
  return grp;
}

function createSolarStorage(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 1.2, H = 0.45, D = 0.9;
  box(grp, 'ss body', 0, H/2, 0, W, H, D, M.darkGrey);
  box(grp, 'ss roof', 0, H + 0.018, 0, W + 0.04, 0.035, D + 0.04, M.metalDark);
  box(grp, 'ss base', 0, 0.04, 0, W + 0.08, 0.06, D + 0.08, M.platform);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const sx = -W/2 + 0.18 + i * 0.27;
      const sz = -D/2 + 0.2 + j * 0.27;
      const panel = box(grp, `ss solar ${i}_${j}`, sx, H + 0.045, sz, 0.24, 0.012, 0.24, M.solar);
      panel.rotation.x = -Math.PI / 28;
    }
  }
  const facadeTex = makeFacadeTextTexture('SOLAR & STORAGE', '#0a0a0a', '#ffcf3a');
  texturedPlane(grp, facadeTex, 0, 0.07, D/2 + 0.011, W - 0.25, 0.06, 0, 0.5);
  for (let i = 0; i < 3; i++) {
    createMegapack(grp, W/2 + 0.18, 0, -D/2 + 0.25 + i * 0.45, 1.0);
  }
  rooftopPanel(grp, '4', '태양광·저장 에너지', '태양광 발전 · 에너지 저장 · 메가팩', 0, H + 0.6, 0, 1.05, 0.34, '#ffcf3a');
  return grp;
}

function createSuperchargerArea(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  box(grp, 'sca base', 0, 0.04, 0, 1.8, 0.06, 0.95, M.platform);
  box(grp, 'sca lane', 0, 0.072, 0, 1.7, 0.005, 0.85, M.road);
  for (let i = 0; i < 6; i++) {
    createSupercharger(grp, -0.65 + i * 0.26, 0, -0.32, 0, 0.85);
  }
  box(grp, 'sca canopy', 0, 0.55, -0.15, 1.7, 0.04, 0.45, M.darkGrey);
  const sccColors = ['#1c1c1e', '#f4f4f4', '#e31937', '#aeb4bd'];
  for (let i = 0; i < 4; i++) {
    createTeslaCar(grp, -0.55 + i * 0.36, 0.07, 0.15, sccColors[i], 0, 0.95);
  }
  createSuperchargerSign(grp, -1.0, 0.04, 0.0, Math.PI / 6, 0.85);
  rooftopPanel(grp, '5', '충전 인프라', '슈퍼차저 네트워크 · 가정용 충전', 0, 0.95, 0, 1.0, 0.34, '#c8c8cc');
  return grp;
}

function createServiceCenter(g, cx, cy, cz) {
  const grp = new THREE.Group();
  grp.position.set(cx, cy, cz);
  g.add(grp);
  const W = 1.4, H = 0.5, D = 0.85;
  box(grp, 'svc body', -0.3, H/2, 0, W * 0.6, H, D, M.darkGrey);
  box(grp, 'svc roof', -0.3, H + 0.02, 0, W * 0.6 + 0.04, 0.035, D + 0.04, M.metalDark);
  box(grp, 'svc base', 0, 0.04, 0, W + 0.08, 0.06, D + 0.08, M.platform);
  box(grp, 'svc front glass', -0.3, H/2 + 0.02, D/2 + 0.005, W * 0.55, H - 0.1, 0.018, M.glass);
  const appDisplay = createTeslaAppDisplay(grp, W/2 - 0.15, 0.04, 0.0, 0.95);
  const facadeTex = makeFacadeTextTexture('SERVICE', '#0a0a0a', '#ffffff');
  texturedPlane(grp, facadeTex, -0.3, 0.085, D/2 + 0.008, W * 0.5, 0.05, 0, 0.4);
  rooftopPanel(grp, '6', '서비스 · 생태계', '테슬라 앱 · 서비스 · 보험 · 업그레이드', 0, 0.95, 0, 1.05, 0.34, '#a259ff');
  return { group: grp, appDisplay };
}
function createTeslaCampus() {
  const g = new THREE.Group();
  box(g, 'plinth', 0, -0.13, 0, gx(6.4), .26, gx(5.6), M.base);
  box(g, 'platform', 0, .02, 0, gx(5.9), .12, gx(5.1), M.platform);
  box(g, 'main road x', 0, 0.084, 0.5, gx(5.6), 0.012, gx(0.5), M.road);
  box(g, 'main road z', 0, 0.084, 0, gx(0.5), 0.012, gx(4.8), M.road);

  const factory = createTeslaFactory(g, 0, 0.08, -1.6);
  createAISoftware(g, -2.7, 0.08, -0.4);
  createSolarStorage(g, 2.85, 0.08, -0.8);
  createSuperchargerArea(g, -1.5, 0.08, 1.75);
  const service = createServiceCenter(g, 1.6, 0.08, 1.75);

  createSatelliteDish(g, 3.3, 0.08, -2.0, 1.0);
  const starlink = createStarlinkSatellite(g, 3.5, 1.5, -1.4, 1.2);
  const starlinkTex = makeFacadeTextTexture('STARLINK', '#0a0a0a', '#4ab8e8');
  texturedPlane(g, starlinkTex, 3.3, 0.7, -1.85, 0.45, 0.07, -Math.PI / 6, 0.45);

  const treeSpots = [
    [-3.4, -2.6], [3.6, -2.6], [-3.6, 2.6], [3.6, 2.6],
    [-3.5, 0.5], [3.5, 0.5], [0, -2.85]
  ];
  treeSpots.forEach(([x, z]) => tree(g, x, z, 0.4));

  const movingCars = [];
  for (let i = 0; i < 3; i++) {
    const car = createTeslaCar(g, -2.0 + i * 2.0, 0.105, 0.5, ['#f4f4f4', '#1c1c1e', '#aeb4bd'][i], Math.PI/2, 1.0);
    movingCars.push({ group: car, axis: 'x', baseX: -2.0 + i * 2.0, z: 0.5 });
  }

  const dataPaths = [];
  const satellites = [
    { name: 'aiSW', x: -2.7, y: 0.7, z: -0.4 },
    { name: 'solar', x: 2.85, y: 0.7, z: -0.8 },
    { name: 'supercharger', x: -1.5, y: 0.55, z: 1.75 },
    { name: 'service', x: 1.6, y: 0.55, z: 1.75 }
  ];
  const satSplashLights = [];
  satellites.forEach((sat, idx) => {
    const start = new THREE.Vector3(0, 0.9, -1.0);
    const mid = new THREE.Vector3((start.x + sat.x)/2, 1.4, (start.z + sat.z)/2);
    const end = new THREE.Vector3(sat.x, sat.y, sat.z);
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const beads = [];
    const beadMat = new THREE.MeshStandardMaterial({
      color: C.hotData, emissive: C.hotData, emissiveIntensity: 2.0, roughness: .25
    });
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(.055, 14, 10), beadMat);
      const bLight = new THREE.PointLight(C.hotData, 0.18, 0.6);
      b.add(bLight);
      g.add(b);
      beads.push({ mesh: b, light: bLight, offset: i / 5 });
    }
    const splash = new THREE.PointLight(C.hotData, 0, 1.4);
    splash.position.set(sat.x, sat.y + 0.1, sat.z);
    g.add(splash);
    satSplashLights.push(splash);
    dataPaths.push({ curve, beads, speed: 0.07 + idx * 0.008 });
  });

  const moneyPaths = [];
  satellites.forEach((sat, idx) => {
    const start = new THREE.Vector3(sat.x, sat.y + 0.3, sat.z);
    const mid = new THREE.Vector3(sat.x / 2, 1.8, (sat.z - 1.6) / 2);
    const end = new THREE.Vector3(0, 1.5, -1.6);
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
    moneyPaths.push({ curve, coins, speed: 0.05 + idx * 0.004 });
  });

  const goldGlow = new THREE.PointLight('#ffd700', 0.65, 2.8);
  goldGlow.position.set(0, 1.5, -1.6);
  g.add(goldGlow);

  const factoryGlow = new THREE.PointLight('#fff8e8', 1.1, 4.5);
  factoryGlow.position.set(0, 0.7, -1.2);
  g.add(factoryGlow);
  const redGlow = new THREE.PointLight('#ff8a9a', 0.75, 2.8);
  redGlow.position.set(1.0, 0.5, -1.3);
  g.add(redGlow);

  g.userData = {
    factoryArms: factory.robotArms,
    appScreen: service.appDisplay.screen,
    dataPaths, satSplashLights, moneyPaths, goldGlow,
    movingCars, starlink
  };
  return g;
}

// ===== Lighting =====
scene.add(new THREE.HemisphereLight('#f2f7ff', '#5a6578', 1.2));
const key = new THREE.DirectionalLight('#ffffff', 2.35);
key.position.set(6, 8, 7);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -9;
key.shadow.camera.right = 9;
key.shadow.camera.top = 9;
key.shadow.camera.bottom = -9;
scene.add(key);
const rim = new THREE.DirectionalLight('#ffb8c4', 0.45);
rim.position.set(-5, 3, -6);
scene.add(rim);
const fillBlue = new THREE.DirectionalLight('#9ec8ff', 0.72);
fillBlue.position.set(-6, 4, 4);
scene.add(fillBlue);

const tesla = createTeslaCampus();
tesla.scale.setScalar(1.0);
scene.add(tesla);

const clock = new THREE.Clock();
const SPEED = 0.4;

function animate() {
  const t = clock.getElapsedTime() * SPEED;
  const tRaw = clock.getElapsedTime();
  const u = tesla.userData;

  u.factoryArms.forEach((arm, i) => {
    arm.shoulder.rotation.y = Math.sin(tRaw * 0.8 + i) * 0.3;
    arm.seg1.rotation.z = -Math.PI / 4 + Math.sin(tRaw * 1.2 + i * 0.5) * 0.2;
    arm.seg2.rotation.z = -Math.PI / 5 + Math.cos(tRaw * 1.0 + i * 0.7) * 0.25;
    arm.led.material.color.setHSL(0.13, 1, 0.5 + 0.3 * Math.sin(tRaw * 5 + i));
  });

  u.dataPaths.forEach((path, pIdx) => {
    path.beads.forEach((b, idx) => {
      const progress = ((tRaw * path.speed) + b.offset) % 1;
      const pos = path.curve.getPoint(progress);
      b.mesh.position.copy(pos);
      const pulse = 1.2 + 0.5 * Math.sin(t * 3 + idx);
      b.mesh.material.emissiveIntensity = pulse;
      b.light.intensity = 0.16 + 0.1 * Math.sin(t * 3.5 + idx);
      if (progress > 0.92) {
        u.satSplashLights[pIdx].intensity = 1.4 * (progress - 0.92) / 0.08;
      }
    });
    u.satSplashLights[pIdx].intensity *= 0.94;
  });

  u.moneyPaths.forEach((path, pIdx) => {
    path.coins.forEach((c, idx) => {
      const progress = ((tRaw * path.speed) + c.offset) % 1;
      const pos = path.curve.getPoint(progress);
      c.mesh.position.copy(pos);
      c.mesh.rotation.x = Math.PI / 2;
      c.mesh.rotation.y = tRaw * 4 + idx;
      c.mesh.material.emissiveIntensity = 1.4 + 0.4 * Math.sin(t * 2.5 + idx);
    });
  });
  u.goldGlow.intensity = 0.4 + 0.25 * Math.sin(t * 1.5);

  u.movingCars.forEach((c, idx) => {
    const speed = 0.3 + idx * 0.05;
    const pos = ((tRaw * speed) + idx * 0.33) % 1;
    c.group.position.x = -3.5 + pos * 7.0;
  });

  u.starlink.rotation.y = tRaw * 0.3;
  u.appScreen.material.emissiveIntensity = 0.5 + 0.2 * Math.sin(t * 1.6);

  tesla.rotation.y = Math.sin(t * .2) * .008;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
