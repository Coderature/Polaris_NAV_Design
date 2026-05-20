import * as THREE from 'three';

type MatOpts = {
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
};

const C = {
  nvGreen: '#76b900',
  nvGreenBright: '#a3e635',
  cyan: '#00d4ff',
  dark: '#0a0a0a',
  darkElev: '#1a1a1a',
  warm: '#ffd9a0',
  white: '#f5f5f5',
  tree: '#2d5a2d',
  bark: '#5a4030',
};

const mat = (color: string, o: MatOpts = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: o.roughness ?? 0.6,
    metalness: o.metalness ?? 0.08,
    transparent: o.transparent ?? false,
    opacity: o.opacity ?? 1,
    emissive: o.emissive ?? '#000000',
    emissiveIntensity: o.emissiveIntensity ?? 0,
  });

const M = {
  dark: mat(C.dark, { roughness: 0.9, metalness: 0.05 }),
  darkElev: mat(C.darkElev, { roughness: 0.7, metalness: 0.2 }),
  nvGreen: mat(C.nvGreen, { emissive: C.nvGreen, emissiveIntensity: 1.6, roughness: 0.25 }),
  nvGreenMid: mat(C.nvGreen, { emissive: C.nvGreen, emissiveIntensity: 1.0, roughness: 0.25 }),
  nvGreenSoft: mat(C.nvGreen, { emissive: C.nvGreen, emissiveIntensity: 0.5, roughness: 0.3 }),
  cyanLed: mat(C.cyan, { emissive: C.cyan, emissiveIntensity: 1.3, roughness: 0.2 }),
  warm: mat(C.warm, { emissive: C.warm, emissiveIntensity: 0.6, roughness: 0.35 }),
  warmFrame: mat('#3a2a18', { roughness: 0.8 }),
  metal: mat('#444444', { roughness: 0.35, metalness: 0.65 }),
  gpuBody: mat('#1a1a1a', { roughness: 0.4, metalness: 0.6 }),
  fin: mat('#0a0a0a', { roughness: 0.3, metalness: 0.5 }),
  lamp: mat(C.warm, { emissive: C.warm, emissiveIntensity: 0.9, roughness: 0.3 }),
};

function box(
  g: THREE.Group,
  name: string,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  material: THREE.Material,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}

function cyl(
  g: THREE.Group,
  name: string,
  x: number,
  y: number,
  z: number,
  r: number,
  h: number,
  material: THREE.Material,
  radial = 16,
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radial), material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawNvidiaEye(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.strokeStyle = C.nvGreen;
  ctx.lineWidth = 8 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy + 10 * scale, 22 * scale, Math.PI * 1.12, Math.PI * 1.88);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy - 10 * scale, 22 * scale, Math.PI * 0.12, Math.PI * 0.88);
  ctx.stroke();
  ctx.fillStyle = C.nvGreen;
  ctx.beginPath();
  ctx.arc(cx, cy, 7 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function makeNvidiaLogoTexture(bg = '#0a0a0a') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  drawNvidiaEye(ctx, 72, c.height / 2, 1.2);
  ctx.fillStyle = C.white;
  ctx.font = 'bold 52px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('nvidia', 130, c.height / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeRTXTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 56px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('RTX', 24, c.height / 2);
  ctx.fillStyle = C.nvGreen;
  ctx.fillRect(150, 28, 8, 40);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeChipDesignTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 600;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0e1a05';
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = C.nvGreenBright;
  ctx.font = 'bold 52px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CHIP DESIGN', c.width / 2, 52);
  ctx.strokeStyle = C.nvGreen;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 72);
  ctx.lineTo(c.width - 120, 72);
  ctx.stroke();

  const chipCx = 280;
  const chipCy = 300;
  const chipS = 90;
  ctx.strokeStyle = C.nvGreen;
  ctx.lineWidth = 3;
  ctx.strokeRect(chipCx - chipS / 2, chipCy - chipS / 2, chipS, chipS);
  drawNvidiaEye(ctx, chipCx - 28, chipCy, 0.9);
  ctx.fillStyle = C.nvGreen;
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('nvidia', chipCx - 2, chipCy + 8);

  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * Math.PI * 2;
    const len = 55 + (i % 3) * 18;
    let ex = chipCx + Math.cos(ang) * len;
    let ey = chipCy + Math.sin(ang) * len;
    if (i % 4 === 0) {
      const mid = len * 0.55;
      const mx = chipCx + Math.cos(ang) * mid;
      const my = chipCy + Math.sin(ang) * mid;
      const perp = ang + Math.PI / 2;
      ex = mx + Math.cos(perp) * 22;
      ey = my + Math.sin(perp) * 22;
      ctx.beginPath();
      ctx.moveTo(chipCx + Math.cos(ang) * (chipS / 2 + 4), chipCy + Math.sin(ang) * (chipS / 2 + 4));
      ctx.lineTo(mx, my);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(chipCx + Math.cos(ang) * (chipS / 2 + 4), chipCy + Math.sin(ang) * (chipS / 2 + 4));
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    ctx.fillStyle = C.nvGreen;
    ctx.fillRect(ex - 4, ey - 4, 8, 8);
  }

  ctx.fillStyle = C.nvGreenBright;
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('CUDA', 620, 140);
  const boxes = ['RT CORES', 'TENSOR CORES', 'NVLINK', 'MEMORY'];
  boxes.forEach((label, i) => {
    const by = 200 + i * 72;
    roundRect(ctx, 600, by, 360, 52, 10);
    ctx.fillStyle = '#050505';
    ctx.fill();
    ctx.strokeStyle = C.nvGreen;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = C.white;
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, 780, by + 30);
  });

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeAIInfraLabelTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = C.dark;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = C.nvGreenBright;
  ctx.font = 'bold 32px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI INFRASTRUCTURE', c.width / 2, c.height / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeGPULabelTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = C.nvGreen;
  roundRect(ctx, 4, 4, c.width - 8, c.height - 8, 12);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.font = 'bold 64px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GPU', c.width / 2, c.height / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function texturedPlane(
  g: THREE.Group,
  tex: THREE.CanvasTexture,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  emissive = 0.55,
  rotY = 0,
) {
  const m = new THREE.MeshStandardMaterial({
    map: tex,
    side: THREE.DoubleSide,
    roughness: 0.4,
    emissive: '#ffffff',
    emissiveMap: tex,
    emissiveIntensity: emissive,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  g.add(mesh);
  return mesh;
}

function addLedRim(
  g: THREE.Group,
  cx: number,
  cy: number,
  cz: number,
  w: number,
  d: number,
  inset: number,
  intensity: number,
  name: string,
) {
  const matLed = mat(C.nvGreen, { emissive: C.nvGreen, emissiveIntensity: intensity, roughness: 0.2 });
  const hw = w / 2 - inset;
  const hd = d / 2 - inset;
  const t = 0.02;
  const h = 0.04;
  box(g, `${name} F`, cx, cy, cz + hd, w - inset * 2, h, t, matLed);
  box(g, `${name} B`, cx, cy, cz - hd, w - inset * 2, h, t, matLed);
  box(g, `${name} L`, cx - hw, cy, cz, t, h, d - inset * 2, matLed);
  box(g, `${name} R`, cx + hw, cy, cz, t, h, d - inset * 2, matLed);
}

function tree(g: THREE.Group, x: number, z: number, s = 0.4) {
  cyl(g, 'tree trunk', x, 0.12 * s, z, 0.03 * s, 0.22 * s, mat(C.bark, { roughness: 0.85 }), 8);
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(0.1 * s, 12, 10),
    mat(C.tree, { roughness: 0.85 }),
  );
  crown.position.set(x, 0.28 * s, z);
  crown.castShadow = true;
  g.add(crown);
}

function buildBase(g: THREE.Group) {
  const slabY = 0.03;
  box(g, 'slab', 0, slabY, 0, 4.4, 0.06, 3.2, M.dark);
  const rimY = 0.065;
  addLedRim(g, 0, rimY, 0, 4.4, 3.2, 0, 1.6, 'rim outer');
  addLedRim(g, 0, rimY, 0, 4.4, 3.2, 0.18, 1.0, 'rim inner');

  box(g, 'rtx foot led', 0, 0.072, 0.38, 1.55, 0.015, 0.58, M.nvGreenMid);

  const lampSpots: [number, number][] = [
    [-1.9, 1.35], [1.9, 1.35], [-1.9, -1.35], [1.9, -1.35], [0, 1.45],
  ];
  lampSpots.forEach(([lx, lz], i) => {
    cyl(g, `lamp post ${i}`, lx, 0.11, lz, 0.015, 0.18, mat(C.darkElev), 6);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), M.lamp);
    cap.position.set(lx, 0.21, lz);
    g.add(cap);
    const light = new THREE.PointLight(C.warm, 0.25, 0.8);
    light.position.set(lx, 0.22, lz);
    g.add(light);
  });
}

function buildHQ(g: THREE.Group): THREE.Mesh[] {
  const hx = -1.3;
  const hy = 0.55;
  const hz = -0.3;
  const grp = new THREE.Group();
  grp.position.set(hx, hy, hz);
  g.add(grp);

  box(grp, 'hq body', 0, 0, 0, 1.5, 1.1, 1.2, M.darkElev);
  box(grp, 'hq logo band', 0, 0.41, 0.61, 1.52, 0.28, 0.02, M.dark);
  const logoTex = makeNvidiaLogoTexture();
  texturedPlane(grp, logoTex, 0, 0.41, 0.625, 1.35, 0.22, 0.65);

  const windows: THREE.Mesh[] = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 5; col++) {
      const wx = -0.52 + col * 0.26;
      const wy = -0.05 + row * 0.22;
      box(grp, `win frame ${row}_${col}`, wx, wy, 0.608, 0.16, 0.18, 0.01, M.warmFrame);
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(0.14, 0.16),
        M.warm.clone(),
      );
      win.position.set(wx, wy, 0.615);
      grp.add(win);
      windows.push(win);
    }
  }
  for (let col = 0; col < 5; col++) {
    box(grp, `mullion ${col}`, -0.52 + col * 0.26, 0.08, 0.612, 0.02, 0.5, 0.008, M.dark);
  }

  box(grp, 'hq canopy', 0.15, -0.42, 0.62, 0.55, 0.05, 0.32, M.nvGreenSoft);
  box(grp, 'hq door', 0.15, -0.48, 0.618, 0.22, 0.32, 0.01, M.dark);
  const doorGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.28),
    mat(C.warm, { emissive: C.warm, emissiveIntensity: 0.35 }),
  );
  doorGlow.position.set(0.15, -0.48, 0.625);
  grp.add(doorGlow);

  box(grp, 'hq roof trim', 0, 0.56, 0, 1.52, 0.04, 1.22, M.dark);
  box(grp, 'vent 0', -0.45, 0.6, 0.2, 0.18, 0.08, 0.18, M.dark);
  box(grp, 'vent 1', 0.45, 0.6, -0.2, 0.18, 0.08, 0.18, M.dark);
  cyl(grp, 'antenna', 0.5, 0.72, -0.35, 0.005, 0.25, M.metal, 6);
  const antLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 6, 6),
    mat('#ff3344', { emissive: '#ff3344', emissiveIntensity: 1.2 }),
  );
  antLed.position.set(0.5, 0.86, -0.35);
  grp.add(antLed);

  tree(g, hx - 0.55, hz + 0.75, 0.38);
  tree(g, hx - 0.2, hz + 0.95, 0.35);
  tree(g, hx + 0.35, hz + 0.7, 0.36);

  return windows;
}

function buildRTXHero(g: THREE.Group) {
  const grp = new THREE.Group();
  grp.position.set(0, 0.21, 0.4);
  grp.rotation.y = -0.18;
  g.add(grp);

  box(grp, 'rtx body', 0, 0, 0, 1.4, 0.32, 0.5, M.gpuBody);
  box(grp, 'rtx top line', 0, 0.165, 0, 1.4, 0.02, 0.5, M.nvGreenMid);
  box(grp, 'rtx bot line', 0, -0.165, 0, 1.4, 0.02, 0.5, M.nvGreenMid);
  box(grp, 'rtx side L', -0.705, 0, 0, 0.005, 0.32, 0.5, mat(C.nvGreen, { emissive: C.nvGreen, emissiveIntensity: 1.1 }));
  box(grp, 'rtx side R', 0.705, 0, 0, 0.005, 0.32, 0.5, mat(C.nvGreen, { emissive: C.nvGreen, emissiveIntensity: 1.1 }));

  const rtxTex = makeRTXTexture();
  texturedPlane(grp, rtxTex, -0.55, 0.02, 0.26, 0.4, 0.15, 0.5, 0);

  for (let i = 0; i < 20; i++) {
    const fy = -0.06 + (i % 10) * 0.014;
    const fz = -0.22 + Math.floor(i / 10) * 0.12;
    box(grp, `fin ${i}`, -0.35, fy, fz, 0.5, 0.18, 0.012, M.fin);
  }

  const fanGrp = new THREE.Group();
  fanGrp.position.set(0.52, 0, 0);
  grp.add(fanGrp);
  const fanHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.28, 24),
    M.gpuBody,
  );
  fanHousing.rotation.z = Math.PI / 2;
  fanGrp.add(fanHousing);
  const fanRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.17, 0.012, 8, 24),
    M.metal,
  );
  fanRim.rotation.y = Math.PI / 2;
  fanGrp.add(fanRim);
  for (let b = 0; b < 9; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.005, 0.04), M.fin);
    blade.rotation.z = (b / 9) * Math.PI * 2;
    blade.position.set(0.06, 0, 0);
    fanGrp.add(blade);
  }
  cyl(fanGrp, 'fan hub', 0, 0, 0, 0.035, 0.006, mat('#222222', { metalness: 0.5 }), 16);

  box(grp, 'io plate', -0.68, -0.02, 0, 0.08, 0.2, 0.35, M.dark);
  box(grp, 'io led 0', -0.72, 0.04, 0.08, 0.01, 0.02, 0.02, M.nvGreen);
  box(grp, 'io led 1', -0.72, 0.04, -0.08, 0.01, 0.02, 0.02, M.nvGreen);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.55),
    mat('#000000', { transparent: true, opacity: 0.35 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -0.17, 0);
  grp.add(shadow);
}

function buildChipDisplay(g: THREE.Group): THREE.Mesh {
  const dx = 0.4;
  const dy = 0.7;
  const dz = -0.5;
  const grp = new THREE.Group();
  grp.position.set(dx, dy, dz);
  grp.rotation.x = -0.05;
  g.add(grp);

  box(grp, 'display bezel', 0, 0, 0, 1.6, 1.0, 0.06, M.dark);
  box(grp, 'display stand', 0, -0.55, 0.02, 0.5, 0.1, 0.15, M.darkElev);
  const kb = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.02, 0.12),
    M.darkElev,
  );
  kb.position.set(0.1, -0.52, 0.12);
  grp.add(kb);
  box(grp, 'kb led 0', 0.22, -0.51, 0.18, 0.012, 0.008, 0.008, M.nvGreen);
  box(grp, 'kb led 1', 0.28, -0.51, 0.18, 0.012, 0.008, 0.008, M.nvGreen);

  const chipTex = makeChipDesignTexture();
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.52, 0.92),
    new THREE.MeshStandardMaterial({
      map: chipTex,
      emissive: '#ffffff',
      emissiveMap: chipTex,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    }),
  );
  screen.position.set(0, 0, 0.032);
  grp.add(screen);
  return screen;
}

function buildAIInfra(g: THREE.Group): THREE.Mesh[] {
  const bx = 1.55;
  const bz = 0.3;
  const pulseLeds: THREE.Mesh[] = [];

  box(g, 'infra platform', bx, 0.09, bz, 1.4, 0.06, 0.85, M.dark);
  addLedRim(g, bx, 0.125, bz, 1.4, 0.85, 0.02, 1.3, 'infra rim');

  const rackW = 0.28;
  const rackH = 0.78;
  const rackD = 0.55;
  const gap = 0.04;
  const startX = bx - 1.5 * (rackW + gap);

  for (let r = 0; r < 4; r++) {
    const rx = startX + r * (rackW + gap);
    const rack = new THREE.Group();
    rack.position.set(rx, 0.12 + rackH / 2, bz);
    g.add(rack);
    box(rack, 'rack body', 0, 0, 0, rackW, rackH, rackD, M.darkElev);
    box(rack, 'rack door', 0, 0, rackD / 2 + 0.004, rackW - 0.02, rackH - 0.04, 0.005, M.dark);

    for (let row = 0; row < 9; row++) {
      const ledW = 0.18 + (row % 3) * 0.04;
      const led = box(
        rack,
        `rack led ${r}_${row}`,
        0,
        rackH / 2 - 0.08 - row * 0.075,
        rackD / 2 + 0.008,
        ledW,
        0.012,
        0.005,
        M.cyanLed.clone(),
      );
      if (r === 1 && (row === 2 || row === 5)) pulseLeds.push(led);
      if (r === 3 && row === 4) pulseLeds.push(led);
      if (row % 2 === 0) {
        box(rack, `rack stripe ${row}`, 0, led.position.y, rackD / 2 + 0.006, rackW - 0.04, 0.006, 0.003, M.dark);
      }
    }
    box(rack, 'status y', 0.08, rackH / 2 - 0.05, rackD / 2 + 0.01, 0.02, 0.02, 0.005, mat('#ffcc00', { emissive: '#ffcc00', emissiveIntensity: 0.8 }));
    box(rack, 'status r', -0.08, rackH / 2 - 0.12, rackD / 2 + 0.01, 0.02, 0.02, 0.005, mat('#ff4444', { emissive: '#ff4444', emissiveIntensity: 0.8 }));
  }

  const labelTex = makeAIInfraLabelTexture();
  texturedPlane(g, labelTex, bx, 0.12 + rackH + 0.08, bz + 0.2, 0.8, 0.12, 0.7, 0);
  box(g, 'infra label rim', bx, 0.12 + rackH + 0.02, bz + 0.2, 0.82, 0.012, 0.1, M.nvGreenMid);

  for (let i = 0; i < 3; i++) {
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.35, 6),
      mat('#050505', { roughness: 0.8 }),
    );
    cable.rotation.x = Math.PI / 2;
    cable.position.set(bx - 0.3 + i * 0.3, 0.25, bz - 0.35);
    g.add(cable);
  }

  tree(g, bx + 0.85, bz + 0.55, 0.34);

  return pulseLeds;
}

function buildFrontLabels(g: THREE.Group) {
  const gpuTex = makeGPULabelTexture();
  const gpuGrp = new THREE.Group();
  gpuGrp.position.set(-0.1, 0.18, 1.35);
  g.add(gpuGrp);
  box(gpuGrp, 'gpu label body', 0, 0, 0, 0.4, 0.12, 0.1, M.darkElev);
  texturedPlane(gpuGrp, gpuTex, 0, 0, 0.052, 0.38, 0.1, 0.75, 0);
  box(gpuGrp, 'gpu label led', 0, 0.065, 0.051, 0.4, 0.006, 0.005, M.nvGreen);

  const nvTex = makeNvidiaLogoTexture('#1a1a1a');
  const nvGrp = new THREE.Group();
  nvGrp.position.set(1.0, 0.2, 1.35);
  g.add(nvGrp);
  box(nvGrp, 'nv label body', 0, 0, 0, 0.8, 0.16, 0.1, M.darkElev);
  texturedPlane(nvGrp, nvTex, 0, 0, 0.052, 0.76, 0.14, 0.6, 0);
  addLedRim(nvGrp, 0, 0, 0, 0.8, 0.1, 0.01, 1.2, 'nv label');
}

function buildNvidiaDiorama() {
  const g = new THREE.Group();
  buildBase(g);
  const hqWindows = buildHQ(g);
  buildRTXHero(g);
  const chipScreen = buildChipDisplay(g);
  const pulseLeds = buildAIInfra(g);
  buildFrontLabels(g);

  g.userData = { hqWindows, chipScreen, pulseLeds };
  return g;
}

interface NvidiaDioramaRuntime {
  hqWindows: THREE.Mesh[];
  chipScreen: THREE.Mesh;
  pulseLeds: THREE.Mesh[];
}

export function createNvidia(): THREE.Group {
  const root = buildNvidiaDiorama();
  root.userData.tick = (time: number) => {
    const u = root.userData as NvidiaDioramaRuntime;
    const warm = 0.6 + Math.sin(time * 0.6) * 0.08;
    u.hqWindows.forEach((w) => {
      (w.material as THREE.MeshStandardMaterial).emissiveIntensity = warm;
    });
    u.pulseLeds.forEach((led, i) => {
      (led.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.3 + Math.sin(time * 1.5 + i * 0.7) * 0.2;
    });
    (u.chipScreen.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.85 + Math.sin(time * 0.4) * 0.05;
  };
  return root;
}

/** Village grid alias (DesignScene NVDA). */
export function createNvidiaFab(): THREE.Group {
  return createNvidia();
}
