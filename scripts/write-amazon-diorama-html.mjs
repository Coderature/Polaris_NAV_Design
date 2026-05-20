/**
 * Legacy writer — prefer: node scripts/amazon-chunks/concat.mjs
 * Then: node scripts/gen-amazon-campus.mjs
 */
import fs from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const concat = path.join(root, 'scripts/amazon-chunks/concat.mjs');
if (fs.existsSync(concat)) {
  spawnSync(process.execPath, [concat], { stdio: 'inherit', cwd: root });
  console.log('concat complete; skipping embedded template');
  process.exit(0);
}


const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Amazon Business Model Diorama · AMZN</title>
  <style>
    html, body {
      width: 100%; height: 100%; margin: 0; overflow: hidden;
      background: radial-gradient(circle at 50% 18%, #2a2218 0%, #14100c 58%, #080604 100%);
      font-family: "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif;
    }
    #hud {
      position: fixed; left: 20px; top: 18px; z-index: 10;
      color: #fff8f0;
      background: rgba(20, 14, 8, 0.88);
      border: 1px solid rgba(255, 153, 0, 0.55);
      border-radius: 16px; padding: 13px 16px;
      line-height: 1.5; pointer-events: none;
      box-shadow: 0 18px 40px rgba(0,0,0,.45);
    }
    #hud b { color: #ff9900; font-size: 18px; letter-spacing: 0.5px; }
    #hud span { color: #e8d8c8; font-size: 13px; }
    #valuechain {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 10;
      background: rgba(18, 12, 8, 0.96);
      padding: 14px 24px;
      border-top: 1px solid rgba(255, 153, 0, 0.45);
      box-shadow: 0 -10px 30px rgba(0,0,0,.4);
      pointer-events: none;
    }
    #valuechain .top { display: flex; align-items: center; gap: 18px; margin-bottom: 8px; }
    #valuechain .brand {
      display: flex; flex-direction: column;
      padding-right: 18px; border-right: 1px solid #3a3028;
      min-width: 180px;
    }
    #valuechain .brand b { font-size: 22px; color: #ff9900; letter-spacing: 3px; font-weight: 700; }
    #valuechain .brand .sub { font-size: 10px; color: #888; letter-spacing: 2px; margin-top: 2px; }
    #valuechain .brand .mission { font-size: 11px; color: #ccc; margin-top: 5px; line-height: 1.3; font-style: italic; }
    #valuechain .steps { display: flex; gap: 8px; flex: 1; flex-wrap: wrap; }
    #valuechain .step {
      flex: 1; min-width: 120px; padding: 8px 10px; border-radius: 8px;
      border: 1px solid #3a3028; background: rgba(30, 22, 14, 0.75);
    }
    #valuechain .step .n {
      display: inline-block; width: 18px; height: 18px; border-radius: 50%;
      text-align: center; line-height: 18px; background: #ff9900; color: #1a1000;
      font-size: 11px; font-weight: 700; margin-right: 6px;
    }
    #valuechain .step .t { display: inline; font-size: 12px; font-weight: 700; color: #fff; }
    #valuechain .step .d { font-size: 10px; color: #999; margin-top: 4px; line-height: 1.35; }
    #tip {
      position: fixed; right: 20px; top: 18px; z-index: 10;
      color: #fff8f0; background: rgba(30, 22, 14, 0.92);
      border-radius: 999px; padding: 9px 14px; font-size: 13px;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="hud">
    <b>AMAZON BUSINESS MODEL</b><br />
    <span>물류 허브 · AWS · Prime · 광고 · 온라인 마켓플레이스</span><br />
    <span style="color:#ff9900">📦 고객에서 클라우드까지 One-Stop</span>
  </div>
  <div id="tip">드래그 회전 · 휠 확대 · 우클릭 이동</div>
  <div id="valuechain">
    <div class="top">
      <div class="brand">
        <b>amazon</b>
        <div class="sub">VALUE CHAIN</div>
        <div class="mission">Earth's Most Customer-Centric<br/>Company</div>
      </div>
      <div class="steps">
        <div class="step"><span class="n">1</span><span class="t">온라인 마켓</span><div class="d">전자상거래·셀러 마켓플레이스</div></div>
        <div class="step"><span class="n">2</span><span class="t">물류·풀필먼트</span><div class="d">FC·배송·라스트마일</div></div>
        <div class="step"><span class="n">3</span><span class="t">AWS 클라우드</span><div class="d">IaaS·PaaS·AI 인프라</div></div>
        <div class="step"><span class="n">4</span><span class="t">Prime</span><div class="d">멤버십·스트리밍·배송 혜택</div></div>
        <div class="step"><span class="n">5</span><span class="t">광고</span><div class="d">검색·디스플레이 광고</div></div>
        <div class="step"><span class="n">6</span><span class="t">디바이스</span><div class="d">Alexa·Kindle·Fire TV</div></div>
      </div>
    </div>
  </div>

  <script type="module">
    import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
    import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

    const GROUND_XZ = 1.25;
    const gx = (n) => n * GROUND_XZ;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#14100c');
    scene.fog = new THREE.Fog('#14100c', 12, 26);

    const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(7, 6, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.75, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 5;
    controls.maxDistance = 16;

    // ===== Palette (Amazon tone: orange, beige warehouse, AWS blue) =====
    const C = {
      orange: '#ff9900', orangeDeep: '#e88b00', smile: '#ff9900',
      warehouse: '#d8c8a0', warehouseDark: '#a89878',
      awsBlue: '#232f3e', awsAccent: '#00a8e1',
      road: '#2a2824', base: '#14100c', platform: '#686050',
      glass: '#b8d4e8', warm: '#ffe8c8',
      hotData: '#7ec8ff', goldGlow: '#ffd970',
      primeBlue: '#00a8e1', adGreen: '#2d8a4a',
      panelBg: '#1a1410', black: '#0a0806', white: '#f5f5f5'
    };

    const mat = (color, o = {}) => new THREE.MeshStandardMaterial({
      color,
      roughness: o.roughness ?? 0.65,
      metalness: o.metalness ?? 0.1,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      emissive: o.emissive ?? '#000000',
      emissiveIntensity: o.emissiveIntensity ?? 0,
      side: o.side ?? THREE.FrontSide
    });

    const M = {
      orange: mat(C.orange, { roughness: .45, emissive: C.orange, emissiveIntensity: .35 }),
      orangeLED: mat(C.orange, { emissive: C.orange, emissiveIntensity: 1.4 }),
      warehouse: mat(C.warehouse, { roughness: .75 }),
      warehouseDark: mat(C.warehouseDark, { roughness: .8 }),
      awsBody: mat(C.awsBlue, { roughness: .5, metalness: .2 }),
      awsLED: mat(C.awsAccent, { emissive: C.awsAccent, emissiveIntensity: 1.3 }),
      road: mat(C.road, { roughness: .85 }),
      base: mat(C.base, { roughness: .6 }),
      platform: mat(C.platform, { roughness: .78 }),
      glass: mat(C.glass, { roughness: .1, transparent: true, opacity: .45, emissive: '#4d8dff', emissiveIntensity: .12 }),
      warmWindow: mat(C.warm, { emissive: '#ffb93d', emissiveIntensity: .5 }),
      metal: mat('#6a6058', { metalness: .5, roughness: .45 }),
      metalDark: mat('#3a3028', { roughness: .7 }),
      black: mat(C.black, { roughness: .4 }),
      white: mat(C.white, { roughness: .35 }),
      packageBrown: mat('#c4a574', { roughness: .8 }),
      primeBlue: mat(C.primeBlue, { emissive: C.primeBlue, emissiveIntensity: .4 }),
      dataBead: new THREE.MeshStandardMaterial({
        color: C.hotData, emissive: C.hotData, emissiveIntensity: 1.6, roughness: .25
      }),
      goldCoin: new THREE.MeshStandardMaterial({
        color: '#ffd700', emissive: '#ffaa00', emissiveIntensity: 1.5,
        roughness: .25, metalness: .85
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
    function tree(g, x, z, s = 0.45) {
      cyl(g, 'trunk', x, s * 0.12, z, s * 0.04, s * 0.24, mat('#5a4030', { roughness: .9 }), 8);
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(s * 0.18, 10, 8),
        mat('#2d6a3a', { roughness: .85 })
      );
      crown.position.set(x, s * 0.32, z);
      crown.castShadow = true;
      g.add(crown);
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
      ctx.strokeStyle = color;
      ctx.lineWidth = w * 0.12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy - w * 0.08, w * 0.42, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      const ax = cx + w * 0.38;
      const ay = cy + w * 0.02;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + w * 0.14, ay - w * 0.1);
      ctx.lineTo(ax + w * 0.06, ay + w * 0.04);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
    function makeAmazonLogoTexture(bg = '#1a1410', fg = '#ff9900') {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('amazon', c.width / 2, c.height / 2 - 20);
      drawAmazonSmile(ctx, c.width / 2, c.height / 2 + 50, 200, fg);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    function makeLabelPanelTexture(num, korTitle, korSubtitle, accent = '#ff9900') {
      const c = document.createElement('canvas');
      c.width = 768; c.height = 280;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#1a1410';
      roundRect(ctx, 6, 6, c.width - 12, c.height - 12, 28);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      roundRect(ctx, 6, 6, c.width - 12, c.height - 12, 28);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px Arial';
      ctx.fillText(num, 48, 95);
      ctx.font = 'bold 52px "Malgun Gothic", Arial';
      ctx.fillText(korTitle, 130, 95);
      if (korSubtitle) {
        ctx.fillStyle = '#c8b8a8';
        ctx.font = '32px "Malgun Gothic", Arial';
        korSubtitle.split('\\n').forEach((line, i) => ctx.fillText(line, 48, 165 + i * 42));
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    function makeFacadeTextTexture(text, bg = '#1a1410', fg = '#ff9900') {
      const c = document.createElement('canvas');
      c.width = 768; c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = fg;
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, c.width / 2, c.height / 2);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    function makeBestSellerTexture(i) {
      const price = 29 + Math.floor(Math.random() * 70);
      const c = document.createElement('canvas');
      c.width = 256; c.height = 320;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 4, 4, c.width - 8, c.height - 8, 12);
      ctx.fill();
      ctx.fillStyle = '#ff9900';
      ctx.font = 'bold 22px Arial';
      ctx.fillText('Best Seller', 16, 36);
      ctx.fillStyle = '#1a1410';
      ctx.font = 'bold 42px Arial';
      ctx.fillText('$' + price, 16, 90);
      ctx.fillStyle = '#888';
      ctx.font = '18px Arial';
      ctx.fillText('★★★★☆', 16, 130);
      ctx.fillStyle = '#ddd';
      roundRect(ctx, 20, 150, c.width - 40, 140, 8);
      ctx.fill();
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return { tex: t, price };
    }
    function makeAWSTexture() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 320;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#232f3e';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#00a8e1';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AWS', c.width / 2, 100);
      ctx.fillStyle = '#8ec8e8';
      ctx.font = '28px Arial';
      ctx.fillText('Amazon Web Services', c.width / 2, 160);
      ctx.font = '22px Arial';
      ctx.fillText('EC2 · S3 · Lambda', c.width / 2, 220);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    function texturedPlane(g, tex, x, y, z, w, h, rotY = 0, emissive = 0.45) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({
          map: tex, side: THREE.DoubleSide,
          emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: emissive, roughness: 0.35
        })
      );
      m.position.set(x, y, z);
      m.rotation.y = rotY;
      g.add(m);
      return m;
    }
    function rooftopPanel(g, num, title, subtitle, x, y, z, w = 0.9, h = 0.32, accent = '#ff9900') {
      const tex = makeLabelPanelTexture(num, title, subtitle, accent);
      const pole = cyl(g, 'panel pole ' + num, x, y - h / 2 - 0.08, z, 0.02, 0.16, M.metalDark, 8);
      pole.position.y = y - h / 2 - 0.08;
      return texturedPlane(g, tex, x, y, z, w, h, 0, 0.5);
    }

    function createDeliveryVan(g, x, y, z, rotY = 0, scale = 1) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      grp.rotation.y = rotY;
      grp.scale.setScalar(scale);
      g.add(grp);
      box(grp, 'van body', 0, 0.14, 0, 0.42, 0.22, 0.28, M.orange);
      box(grp, 'van cab', -0.18, 0.16, 0.02, 0.14, 0.18, 0.22, M.warehouseDark);
      box(grp, 'van stripe', 0.02, 0.2, 0.15, 0.35, 0.04, 0.02, M.black);
      const logoTex = makeAmazonLogoTexture('#ff9900', '#1a1410');
      texturedPlane(grp, logoTex, 0.02, 0.22, 0.16, 0.22, 0.08, 0, 0.35);
      for (let i = 0; i < 4; i++) {
        cyl(grp, 'wheel ' + i, -0.12 + (i % 2) * 0.24, 0.05, (i < 2 ? -0.1 : 0.1), 0.05, 0.03, M.black, 12);
      }
      return { group: grp };
    }

    function createPackage(g, x, y, z, scale = 1) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      grp.scale.setScalar(scale);
      g.add(grp);
      box(grp, 'pkg', 0, 0.06, 0, 0.12, 0.12, 0.12, M.packageBrown);
      box(grp, 'pkg tape', 0, 0.06, 0.061, 0.12, 0.02, 0.005, M.orange);
      return grp;
    }

    function createFulfillmentCenter(g, cx, cy, cz) {
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      g.add(grp);
      const W = 4.2, H = 1.1, D = 2.4;
      box(grp, 'fc slab', 0, 0.03, 0, W + 0.2, 0.06, D + 0.2, M.platform);
      box(grp, 'fc body', 0, H / 2 + 0.06, 0, W, H, D, M.warehouse);
      box(grp, 'fc roof', 0, H + 0.09, 0, W + 0.05, 0.08, D + 0.05, M.warehouseDark);
      box(grp, 'fc stripe', 0, H * 0.55, D / 2 + 0.01, W - 0.2, 0.35, 0.04, M.orange);
      const logoTex = makeAmazonLogoTexture('#d8c8a0', '#ff9900');
      texturedPlane(grp, logoTex, 0, H * 0.55, D / 2 + 0.025, 1.8, 0.5, 0, 0.4);
      for (let i = 0; i < 3; i++) {
        const dx = -1.2 + i * 1.2;
        box(grp, 'dock ' + i, dx, 0.2, D / 2 + 0.15, 0.7, 0.55, 0.08, M.metalDark);
        box(grp, 'dock door ' + i, dx, 0.35, D / 2 + 0.19, 0.55, 0.45, 0.02, M.black);
      }
      for (let i = 0; i < 8; i++) {
        const px = -1.5 + (i % 4) * 1.0;
        const pz = -0.4 + Math.floor(i / 4) * 0.5;
        createPackage(grp, px, 0.14, pz, 0.9);
      }
      const convY = 0.18;
      box(grp, 'conveyor', 0, convY, -D / 2 + 0.35, W * 0.7, 0.04, 0.35, M.metal);
      for (let i = 0; i < 6; i++) {
        box(grp, 'roller ' + i, -1.2 + i * 0.48, convY + 0.03, -D / 2 + 0.35, 0.08, 0.06, 0.32, M.metalDark);
      }
      rooftopPanel(grp, '2', '물류·풀필먼트', 'FC·배송·라스트마일', 0, H + 0.55, 0);
      const packages = [];
      for (let i = 0; i < 4; i++) {
        const pkg = createPackage(grp, -1.0 + i * 0.55, convY + 0.12, -D / 2 + 0.35, 0.85);
        packages.push({ mesh: pkg, offset: i / 4 });
      }
      return { group: grp, packages, convZ: -D / 2 + 0.35, convXMin: -1.2, convXMax: 1.2 };
    }

    function createAmazonHQ(g, cx, cy, cz) {
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      g.add(grp);
      box(grp, 'hq base', 0, 0.04, 0, 1.6, 0.08, 1.2, M.platform);
      box(grp, 'hq tower', 0, 0.55, 0, 1.2, 1.0, 0.9, M.glass);
      const hqWindows = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const wx = -0.42 + col * 0.28;
          const wy = 0.25 + row * 0.28;
          const win = box(grp, 'hq win ' + row + '_' + col, wx, wy, 0.46, 0.18, 0.2, 0.02, M.warmWindow.clone());
          if (Math.random() > 0.33) win.material.emissiveIntensity = 0.65;
          hqWindows.push(win);
        }
      }
      const spheres = [[-0.35, 0.35, 0.2], [0.35, 0.35, 0.2]];
      spheres.forEach(([sx, sy, sz], i) => {
        const sph = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 16, 12),
          M.glass.clone()
        );
        sph.position.set(sx, sy, sz);
        sph.scale.set(1, 0.75, 1);
        grp.add(sph);
        box(grp, 'sphere base ' + i, sx, sy - 0.18, sz, 0.35, 0.06, 0.35, M.metalDark);
      });
      const logoTex = makeAmazonLogoTexture();
      texturedPlane(grp, logoTex, 0, 1.05, 0.48, 0.7, 0.28, 0, 0.55);
      rooftopPanel(grp, '1', '온라인 마켓', '전자상거래·마켓플레이스', 0, 1.15, 0, 0.85, 0.3);
      return { group: grp, hqWindows };
    }

    function createAWSDataCenter(g, cx, cy, cz) {
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      g.add(grp);
      box(grp, 'aws pad', 0, 0.04, 0, 1.5, 0.06, 1.0, M.awsBody);
      const racks = [];
      for (let i = 0; i < 4; i++) {
        const rx = -0.45 + i * 0.3;
        box(grp, 'rack ' + i, rx, 0.45, 0, 0.22, 0.78, 0.5, M.awsBody);
        const leds = [];
        for (let j = 0; j < 8; j++) {
          const led = box(grp, 'rack led ' + i + '_' + j, rx, 0.12 + j * 0.09, 0.26, 0.16, 0.012, 0.005, M.awsLED.clone());
          leds.push(led);
        }
        racks.push({ leds });
      }
      const awsTex = makeAWSTexture();
      texturedPlane(grp, awsTex, 0, 0.55, 0.28, 0.9, 0.55, 0, 0.6);
      rooftopPanel(grp, '3', 'AWS 클라우드', 'IaaS·PaaS·AI 인프라', 0, 0.95, 0, 0.9, 0.3, '#00a8e1');
      return { group: grp, racks };
    }

    function createPrimeHub(g, cx, cy, cz) {
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      g.add(grp);
      box(grp, 'prime base', 0, 0.04, 0, 1.1, 0.06, 0.9, M.platform);
      box(grp, 'prime body', 0, 0.35, 0, 0.95, 0.55, 0.75, M.primeBlue);
      const primeTex = makeFacadeTextTexture('prime', '#00a8e1', '#ffffff');
      texturedPlane(grp, primeTex, 0, 0.42, 0.4, 0.7, 0.25, 0, 0.55);
      rooftopPanel(grp, '4', 'Prime', '멤버십·스트리밍·배송', 0, 0.72, 0, 0.8, 0.28, '#00a8e1');
      return { group: grp };
    }

    function createOnlineStore(g, cx, cy, cz) {
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      g.add(grp);
      box(grp, 'store base', 0, 0.04, 0, 1.0, 0.06, 0.85, M.platform);
      box(grp, 'store body', 0, 0.32, 0, 0.85, 0.5, 0.7, M.white);
      const screens = [];
      for (let i = 0; i < 3; i++) {
        const { tex } = makeBestSellerTexture(i);
        const screen = texturedPlane(grp, tex, -0.22 + i * 0.22, 0.38, 0.37, 0.18, 0.28, 0, 0.5);
        screens.push(screen);
      }
      const shopTex = makeFacadeTextTexture('amazon.com', '#ff9900', '#1a1410');
      texturedPlane(grp, shopTex, 0, 0.55, 0.38, 0.6, 0.12, 0, 0.45);
      return { group: grp, screens };
    }

    function createAdvertisingTower(g, cx, cy, cz) {
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      g.add(grp);
      cyl(grp, 'ad pole', 0, 0.35, 0, 0.04, 0.7, M.metalDark, 10);
      box(grp, 'ad board', 0, 0.78, 0.02, 0.55, 0.42, 0.04, M.black);
      const adTex = makeFacadeTextTexture('Sponsored', '#2d8a4a', '#ffffff');
      texturedPlane(grp, adTex, 0, 0.78, 0.045, 0.5, 0.35, 0, 0.55);
      rooftopPanel(grp, '5', '광고', '검색·디스플레이 광고', 0, 1.02, 0, 0.75, 0.26, '#2d8a4a');
      return { group: grp };
    }

    function createDevicesKiosk(g, cx, cy, cz) {
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      g.add(grp);
      box(grp, 'kiosk', 0, 0.2, 0, 0.5, 0.35, 0.4, M.metalDark);
      box(grp, 'echo', 0, 0.42, 0.05, 0.18, 0.22, 0.18, M.black);
      cyl(grp, 'echo ring', 0, 0.42, 0.05, 0.1, 0.04, M.orangeLED, 16);
      box(grp, 'kindle', -0.12, 0.32, -0.05, 0.1, 0.14, 0.02, M.white);
      rooftopPanel(grp, '6', '디바이스', 'Alexa·Kindle·Fire TV', 0, 0.55, 0, 0.75, 0.26);
      return { group: grp };
    }

    function createAmazonCampus() {
      const g = new THREE.Group();
      box(g, 'plinth', 0, 0.02, 0, gx(5.8), 0.04, gx(5.2), M.base);
      box(g, 'platform', 0, 0.06, 0, gx(5.4), 0.08, gx(4.8), M.platform);
      box(g, 'road x', 0, 0.084, 0.2, gx(5.2), 0.012, gx(0.45), M.road);
      box(g, 'road z', 0, 0.084, 0, gx(0.45), 0.012, gx(4.6), M.road);

      const fc = createFulfillmentCenter(g, 0, 0.08, -1.2);
      const hq = createAmazonHQ(g, -2.5, 0.08, 0.6);
      const aws = createAWSDataCenter(g, 2.6, 0.08, -0.5);
      const prime = createPrimeHub(g, -1.4, 0.08, 1.9);
      const store = createOnlineStore(g, 1.5, 0.08, 1.85);
      createAdvertisingTower(g, 2.8, 0.08, 1.6);
      createDevicesKiosk(g, -2.8, 0.08, -1.8);

      const vans = [];
      [[-1.8, 0.1, 0.5, 0.4], [1.2, 0.1, -0.2, -0.5], [0.5, 0.1, 1.2, Math.PI]].forEach(([x, y, z, r], i) => {
        vans.push({ ...createDeliveryVan(g, x, y, z, r), pathPhase: i * 2.1 });
      });

      const treeSpots = [[-3.2, -2.4], [3.2, -2.4], [-3.2, 2.4], [3.2, 2.4], [-3.0, 0], [3.0, 0]];
      treeSpots.forEach(([x, z]) => tree(g, x, z, 0.42));

      const dataPaths = [];
      const satellites = [
        { x: -2.5, y: 0.9, z: 0.6 },
        { x: 2.6, y: 0.85, z: -0.5 },
        { x: -1.4, y: 0.65, z: 1.9 },
        { x: 1.5, y: 0.55, z: 1.85 }
      ];
      const splashLights = [];
      satellites.forEach((sat, idx) => {
        const angle = Math.atan2(sat.z, sat.x);
        const start = new THREE.Vector3(Math.cos(angle) * 1.2, 0.5, Math.sin(angle) * 1.2);
        const mid = new THREE.Vector3((start.x + sat.x) / 2, 1.2, (start.z + sat.z) / 2);
        const end = new THREE.Vector3(sat.x, sat.y, sat.z);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const beads = [];
        for (let i = 0; i < 4; i++) {
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), M.dataBead);
          const bl = new THREE.PointLight(C.hotData, 0.15, 0.55);
          b.add(bl);
          g.add(b);
          beads.push({ mesh: b, light: bl, offset: i / 4 });
        }
        const splash = new THREE.PointLight(C.hotData, 0, 1.2);
        splash.position.set(sat.x, sat.y, sat.z);
        g.add(splash);
        splashLights.push(splash);
        dataPaths.push({ curve, beads, speed: 0.08 + idx * 0.01 });
      });

      const moneyPaths = [];
      satellites.forEach((sat, idx) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(sat.x, sat.y + 0.2, sat.z),
          new THREE.Vector3(sat.x / 2, 1.6, sat.z / 2),
          new THREE.Vector3(0, 1.0, -1.0)
        ]);
        const coins = [];
        for (let i = 0; i < 2; i++) {
          const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 14), M.goldCoin.clone());
          g.add(coin);
          coins.push({ mesh: coin, offset: i / 2 });
        }
        moneyPaths.push({ curve, coins, speed: 0.06 + idx * 0.005 });
      });

      const orangeGlow = new THREE.PointLight('#ff9900', 0.55, 4);
      orangeGlow.position.set(0, 1.0, -1.0);
      g.add(orangeGlow);

      g.userData = {
        hqWindows: hq.hqWindows,
        fc,
        aws,
        store,
        dataPaths,
        splashLights,
        moneyPaths,
        orangeGlow,
        vans
      };
      return g;
    }

    // ===== Lighting =====
    scene.add(new THREE.HemisphereLight('#ffe8d0', '#14100c', 0.9));
    const key = new THREE.DirectionalLight('#fff8f0', 1.8);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#ff9900', 0.35);
    rim.position.set(-4, 3, -5);
    scene.add(rim);

    const amazon = createAmazonCampus();
    scene.add(amazon);

    const clock = new THREE.Clock();
    const SPEED = 0.4;
    function animate() {
      const t = clock.getElapsedTime() * SPEED;
      const tRaw = clock.getElapsedTime();
      const u = amazon.userData;

      u.hqWindows.forEach((win, i) => {
        win.material.emissiveIntensity = 0.35 + 0.35 * Math.max(0, Math.sin(t * 0.8 + i * 0.4));
      });

      u.aws.racks.forEach((rack, rIdx) => {
        rack.leds.forEach((led, j) => {
          led.material.emissiveIntensity = 0.9 + 0.5 * Math.max(0, Math.sin(tRaw * 2 + rIdx + j * 0.6));
        });
      });

      u.store.screens.forEach((s, i) => {
        s.material.emissiveIntensity = 0.45 + 0.2 * Math.sin(t * 1.5 + i);
      });

      u.fc.packages.forEach((p) => {
        const progress = ((tRaw * 0.15) + p.offset) % 1;
        p.mesh.position.x = u.fc.convXMin + (u.fc.convXMax - u.fc.convXMin) * progress;
      });

      u.dataPaths.forEach((path, pIdx) => {
        path.beads.forEach((b, idx) => {
          const progress = ((tRaw * path.speed) + b.offset) % 1;
          b.mesh.position.copy(path.curve.getPoint(progress));
          b.mesh.material.emissiveIntensity = 1.2 + 0.5 * Math.sin(t * 3 + idx);
          b.light.intensity = 0.14 + 0.08 * Math.sin(t * 3.5 + idx);
          if (progress > 0.92) u.splashLights[pIdx].intensity = 1.3 * (progress - 0.92) / 0.08;
        });
        u.splashLights[pIdx].intensity *= 0.93;
      });

      u.moneyPaths.forEach((path) => {
        path.coins.forEach((c, idx) => {
          const progress = ((tRaw * path.speed) + c.offset) % 1;
          c.mesh.position.copy(path.curve.getPoint(progress));
          c.mesh.rotation.x = Math.PI / 2;
          c.mesh.rotation.y = tRaw * 3 + idx;
          c.mesh.material.emissiveIntensity = 1.3 + 0.3 * Math.sin(t * 2 + idx);
        });
      });

      u.vans.forEach((v) => {
        const a = v.pathPhase + tRaw * 0.12;
        v.group.position.x = Math.cos(a) * 2.2;
        v.group.position.z = Math.sin(a) * 1.6;
        v.group.rotation.y = -a + Math.PI / 2;
      });

      u.orangeGlow.intensity = 0.45 + 0.2 * Math.sin(t * 1.2);
      amazon.rotation.y = Math.sin(t * 0.18) * 0.006;

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
  </script>
</body>
</html>`;

fs.writeFileSync('public/amazon-business-model-diorama.html', html);
console.log('wrote public/amazon-business-model-diorama.html', html.length, 'chars');
