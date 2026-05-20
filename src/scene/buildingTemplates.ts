import * as THREE from 'three';

// ── helpers ───────────────────────────────────────────────────────────────────
function mat(hex: number, roughness = 0.65, metalness = 0.1): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: hex, roughness, metalness });
}

// py = bottom Y of the shape
function bx(w: number, h: number, d: number, m: THREE.Material, px = 0, py = 0, pz = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.position.set(px, py + h / 2, pz);
  return mesh;
}

// py = bottom Y of the cylinder
function cy(r: number, h: number, m: THREE.Material, px = 0, py = 0, pz = 0, segs = 10): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r, h, segs), m);
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.position.set(px, py + h / 2, pz);
  return mesh;
}

function grp(...parts: THREE.Object3D[]): THREE.Group {
  const g = new THREE.Group();
  parts.forEach(p => g.add(p));
  return g;
}

/** XZ footprint multiplier for ground slabs (plinth / platform / roads). */
const GROUND_FOOTPRINT_XZ = 1.25;
const gx = (n: number) => n * GROUND_FOOTPRINT_XZ;

// ── Boeing: Assembly Diorama (BA) ──
export { createBoeing } from './boeingAssembly';

// ── NVIDIA: Three-Pillar Diorama (NVDA) ──
export { createNvidiaFab } from './nvidia';

// ── Exxon Mobil: oil refinery ─────────────────────────────────────────────────
export function createExxonMobil(): THREE.Group {
  const pad   = mat(0x585c66, 0.85);
  const tank  = mat(0xc0b090, 0.55, 0.2);
  const bldg  = mat(0x8a7a6a);
  const pipe  = mat(0x484848, 0.7, 0.3);
  const flame = mat(0xdd3a10, 0.55);
  return grp(
    bx(gx(4.0), 0.25, gx(4.0), pad,            0,     0,    0),   // base pad
    bx(2.0, 1.8,  2.0, bldg,          -0.6,   0.25, 0),   // process building
    bx(2.0, 0.18, 2.0, pipe,          -0.6,   2.05, 0),   // building roof
    cy(0.75, 1.4, tank,                1.3,   0.25, -0.5, 12), // storage tank A
    cy(0.55, 1.1, tank,                1.3,   0.25,  0.9, 12), // storage tank B
    bx(0.22, 0.22, 0.22, tank,         1.3,   1.65, -0.5),    // dome A
    bx(0.18, 0.18, 0.18, tank,         1.3,   1.35,  0.9),    // dome B
    cy(0.12, 3.8, pipe,               -1.55,  0.25,  0,   6), // main flare stack
    cy(0.09, 2.8, pipe,               -1.85,  0.25,  0.6, 6), // stack 2
    bx(0.2, 0.2,  0.2, flame,         -1.55,  4.05,  0),      // flare flame
    bx(2.5, 0.12, 0.22, pipe,          0.2,   1.2,   0),      // horizontal pipe
  );
}

// ── Samsung Electronics: v4 Semiconductor Fab Edition (005930) ────────────
export { createSamsungFab } from './samsungFab';

// ── S-Oil: 1셀 슬림 · Gas Station Edition v3 (010950) ───────────────────────
export function createSOilRefinery(): THREE.Group {
  const green = mat(0x0b5a35, 0.55, 0.15);
  const greenDark = mat(0x063a22, 0.5, 0.2);
  const yellow = mat(0xf4c430, 0.45, 0.05);
  const cream = mat(0xe8e4d0, 0.75, 0.1);
  const paper = mat(0xd8ccb4, 0.8);
  const wood = mat(0x6d4b32, 0.58);
  const metal = mat(0xc0c0c0, 0.3, 0.7);
  const metalDark = mat(0x888888, 0.5, 0.4);
  const pipeM = mat(0x666666, 0.38, 0.6);
  const road = mat(0x242824, 0.8);
  const whiteAccent = mat(0xf4f4f4, 0.6);
  const glass = new THREE.MeshStandardMaterial({
    color: 0xa8d4ee,
    transparent: true,
    opacity: 0.55,
    roughness: 0.1,
    metalness: 0.1,
    emissive: 0x3a78a0,
    emissiveIntensity: 0.15,
  });
  const glassDark = mat(0x2a3a4a, 0.2, 0.5);
  const warmWindow = new THREE.MeshStandardMaterial({
    color: 0xfff2c8,
    roughness: 0.35,
    emissive: 0xffb93d,
    emissiveIntensity: 0.85,
  });
  const oilDropMat = new THREE.MeshStandardMaterial({
    color: 0x2a1500,
    roughness: 0.15,
    metalness: 0.3,
    emissive: 0x3a1a08,
    emissiveIntensity: 0.4,
  });
  const smokeMat = new THREE.MeshBasicMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.45,
  });
  const gasPad = mat(0xbdbdb5, 0.95);
  const gasLine = mat(0xfff8e8, 0.8);
  const pumpBody = mat(0xe8e4d0, 0.7);
  const pumpScreen = new THREE.MeshStandardMaterial({
    color: 0x003322,
    emissive: 0x1a8a55,
    emissiveIntensity: 1.5,
  });
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff8c0 });

  const root = new THREE.Group();
  const add = (o: THREE.Object3D) => {
    root.add(o);
    return o;
  };
  const cbx = (sx: number, sy: number, sz: number, m: THREE.Material, x: number, y: number, z: number) =>
    add(bx(sx, sy, sz, m, x, y - sy / 2, z)) as THREE.Mesh;

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const makeSignTexture = (text: string, bg: string, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bg;
    roundRect(ctx, 14, 14, canvas.width - 28, canvas.height - 28, 28);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    roundRect(ctx, 14, 14, canvas.width - 28, canvas.height - 28, 28);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.font = 'bold 130px Arial, sans-serif';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const addSign = (
    text: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    bg: string,
    color: string,
    rotX = 0,
  ) => {
    const tex = makeSignTexture(text, bg, color);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({
        map: tex,
        side: THREE.DoubleSide,
        emissive: 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: 0.2,
      }),
    );
    mesh.position.set(x, y, z);
    mesh.rotation.x = rotX;
    mesh.castShadow = true;
    return add(mesh);
  };

  const makePriceBoardTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 320;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b5a35';
    ctx.fillRect(8, 8, canvas.width - 16, 60);
    ctx.fillStyle = '#fff8e8';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S-OIL', canvas.width / 2, 40);
    ctx.fillStyle = '#ff7a00';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    const labels = ['휘발유', '경유', 'LPG'];
    const prices = ['1,657', '1,527', '1,077'];
    for (let i = 0; i < 3; i++) {
      ctx.fillText(labels[i]!, 18, 110 + i * 60);
      ctx.textAlign = 'right';
      ctx.fillText(prices[i]!, canvas.width - 18, 110 + i * 60);
      ctx.textAlign = 'left';
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const addToGroup = (parent: THREE.Group, o: THREE.Object3D) => {
    parent.add(o);
    return o;
  };

  const cbxG = (g: THREE.Group, sx: number, sy: number, sz: number, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    return addToGroup(g, mesh) as THREE.Mesh;
  };

  const createGasStation = (baseX: number, baseZ: number) => {
    const station = new THREE.Group();
    station.position.set(baseX, 0, baseZ);
    add(station);

    cbxG(station, 0.9, 0.02, 0.7, gasPad, 0, 0.13, 0);
    cbxG(station, 0.005, 0.005, 0.18, gasLine, -0.18, 0.142, 0.15);
    cbxG(station, 0.005, 0.005, 0.18, gasLine, 0.18, 0.142, 0.15);
    cbxG(station, 0.005, 0.005, 0.18, gasLine, -0.18, 0.142, -0.15);
    cbxG(station, 0.005, 0.005, 0.18, gasLine, 0.18, 0.142, -0.15);

    for (const [px, pz] of [
      [-0.38, -0.28],
      [0.38, -0.28],
      [-0.38, 0.18],
      [0.38, 0.18],
    ]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 12), metalDark);
      pillar.position.set(px, 0.34, pz);
      pillar.castShadow = true;
      addToGroup(station, pillar);
    }

    cbxG(station, 0.85, 0.04, 0.55, whiteAccent, 0, 0.56, -0.05);
    cbxG(station, 0.87, 0.06, 0.03, green, 0, 0.535, 0.225);
    cbxG(station, 0.03, 0.06, 0.55, green, -0.43, 0.535, -0.05);
    cbxG(station, 0.03, 0.06, 0.55, green, 0.43, 0.535, -0.05);

    [[-0.18, -0.05], [0.18, -0.05]].forEach(([px, pz]) => {
      cbxG(station, 0.08, 0.16, 0.05, pumpBody, px, 0.22, pz);
      cbxG(station, 0.06, 0.04, 0.005, pumpScreen, px, 0.27, pz - 0.0265);
      const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), mat(0x222222));
      hose.position.set(px + 0.045, 0.18, pz - 0.025);
      hose.rotation.z = Math.PI / 4;
      addToGroup(station, hose);
    });

    cbxG(station, 0.55, 0.3, 0.18, whiteAccent, 0, 0.27, -0.55);
    cbxG(station, 0.57, 0.05, 0.2, green, 0, 0.43, -0.55);
    cbxG(station, 0.4, 0.13, 0.01, glassDark, 0, 0.22, -0.45);
    cbxG(station, 0.38, 0.11, 0.005, warmWindow.clone(), 0, 0.22, -0.444);

    const storeTex = makeSignTexture('S-OIL', '#ffffff', '#0b5a35');
    const storeSign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.08),
      new THREE.MeshStandardMaterial({
        map: storeTex,
        side: THREE.DoubleSide,
        emissive: 0xffffff,
        emissiveMap: storeTex,
        emissiveIntensity: 0.2,
      }),
    );
    storeSign.position.set(0, 0.46, -0.443);
    addToGroup(station, storeSign);

    const priceTex = makePriceBoardTexture();
    const priceBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.22),
      new THREE.MeshStandardMaterial({
        map: priceTex,
        emissive: 0xffffff,
        emissiveMap: priceTex,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide,
      }),
    );
    priceBoard.position.set(0.55, 0.35, 0.05);
    priceBoard.rotation.y = -Math.PI / 2;
    addToGroup(station, priceBoard);
    const pricePole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), metalDark);
    pricePole.position.set(0.55, 0.18, 0.05);
    addToGroup(station, pricePole);

    const car = new THREE.Group();
    car.position.set(-0.18, 0.18, 0.08);
    addToGroup(station, car);
    cbxG(car, 0.18, 0.06, 0.1, whiteAccent, 0, 0, 0);
    cbxG(car, 0.13, 0.04, 0.09, whiteAccent, 0, 0.05, 0);
    const hl1 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), headlightMat.clone());
    hl1.position.set(0.09, 0, 0.035);
    addToGroup(car, hl1);
    const hl2 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), headlightMat.clone());
    hl2.position.set(0.09, 0, -0.035);
    addToGroup(car, hl2);
    for (const [wx, wz] of [
      [-0.06, -0.04],
      [0.06, -0.04],
      [-0.06, 0.04],
      [0.06, 0.04],
    ]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.015, 8), mat(0x1a1a1a));
      wheel.position.set(wx, -0.03, wz);
      wheel.rotation.x = Math.PI / 2;
      addToGroup(car, wheel);
    }

    const canopyLight = new THREE.PointLight(0xfff8c0, 0.6, 1.2);
    canopyLight.position.set(0, 0.5, 0);
    station.add(canopyLight);

    return { canopyLight, headlights: [hl1, hl2] as THREE.Mesh[] };
  };

  const addPipe = (px: number, py: number, pz: number, len: number, axis: 'x' | 'tilt') => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 8), pipeM);
    mesh.position.set(px, py, pz);
    if (axis === 'x') mesh.rotation.z = Math.PI / 2;
    else {
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.z = Math.PI / 8;
    }
    mesh.castShadow = mesh.receiveShadow = true;
    return add(mesh);
  };

  const createTree = (x: number, y: number, z: number) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.3, 8), mat(0x5a3a20, 0.85));
    trunk.position.set(x, y - 0.7, z);
    trunk.castShadow = true;
    add(trunk);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), mat(0x2a6b3a, 0.7));
    leaves.position.set(x, y - 0.45, z);
    leaves.castShadow = true;
    add(leaves);
  };

  cbx(gx(4.8), 0.26, gx(4.3), wood, 0, -0.13, 0);
  cbx(gx(4.35), 0.12, gx(3.85), paper, 0, 0.02, 0);
  cbx(gx(4.0), 0.04, gx(0.5), road, 0, 0.1, 1.5);
  cbx(gx(2.45), 0.04, gx(0.38), road, 0.6, 0.11, -0.55);

  const hqX = -1.4;
  const hqZ = -0.55;
  cbx(1.6, 2.4, 1.2, green, hqX, 1.2, hqZ);
  cbx(1.7, 0.14, 1.3, whiteAccent, hqX, 2.46, hqZ);
  cbx(0.9, 0.22, 0.7, greenDark, hqX, 2.65, hqZ);

  const winCols = 6;
  const winRows = 8;
  const winW = 0.18;
  const winH = 0.22;
  const winGapX = 0.05;
  const winGapY = 0.05;
  const totalW = winCols * winW + (winCols - 1) * winGapX;
  const totalH = winRows * winH + (winRows - 1) * winGapY;
  const startX = hqX - totalW / 2 + winW / 2;
  const startY = 1.2 - totalH / 2 + winH / 2;

  const frontWindows: { mesh: THREE.Mesh; row: number; col: number }[] = [];
  for (let row = 0; row < winRows; row++) {
    for (let col = 0; col < winCols; col++) {
      const x = startX + col * (winW + winGapX);
      const y = startY + row * (winH + winGapY);
      frontWindows.push({
        mesh: cbx(winW, winH, 0.025, warmWindow.clone(), x, y, 0.06),
        row,
        col,
      });
    }
  }
  for (let i = 0; i < 5; i++) {
    const x = startX - winW / 2 - winGapX / 2 + i * (winW + winGapX);
    cbx(0.025, totalH + 0.1, 0.03, whiteAccent, x, 1.2, 0.07);
  }
  cbx(0.035, 2.2, 1.1, glass, -2.215, 1.2, hqZ);
  cbx(0.035, 2.2, 1.1, glass, -0.585, 1.2, hqZ);
  cbx(1.3, 0.4, 0.06, glassDark, hqX, 0.25, 0.07);
  cbx(1.4, 0.05, 0.25, whiteAccent, hqX, 0.5, 0.18);
  cbx(0.4, 0.18, 0.03, warmWindow.clone(), hqX, 0.2, 0.085);
  cbx(0.3, 0.2, 0.3, metalDark, -1.7, 2.62, -0.7);
  cbx(0.3, 0.2, 0.3, metalDark, -1.1, 2.62, -0.4);

  const dishPivot = new THREE.Group();
  dishPivot.position.set(-1.8, 2.92, hqZ);
  add(dishPivot);
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.2),
    metal,
  );
  dish.rotation.x = Math.PI;
  dishPivot.add(dish);
  const dishAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), metalDark);
  dishAntenna.position.set(0, 0.12, 0);
  dishPivot.add(dishAntenna);
  const dishLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xff3355 }),
  );
  dishLed.position.set(0, 0.24, 0);
  dishPivot.add(dishLed);

  const roofSign = addSign('S-OIL', hqX, 2.85, 0.1, 1.0, 0.32, '#ffffff', '#0b5a35');
  roofSign.rotation.x = -Math.PI / 10;
  cbx(0.04, 0.28, 0.04, metalDark, -1.85, 2.72, 0.1);
  cbx(0.04, 0.28, 0.04, metalDark, -0.95, 2.72, 0.1);
  addSign('S-OIL', hqX, 1.7, 0.084, 0.9, 0.32, '#0b5a35', '#ffffff');

  add(cy(0.38, 3.0, metal, 0, 0, 0, 16));
  add(cy(0.49, 0.06, yellow, 0, 0.92, 0, 24));
  add(cy(0.47, 0.06, yellow, 0, 1.67, 0, 24));
  add(cy(0.44, 0.06, yellow, 0, 2.42, 0, 24));
  add(cy(0.21, 0.15, metalDark, 0, 2.995, 0, 16));
  add(cy(0.22, 2.2, metalDark, 0.7, 0, 0.5, 14));
  add(cy(0.19, 0.12, metalDark, 0.7, 2.18, 0.5, 14));

  type SmokeBead = {
    mesh: THREE.Mesh;
    baseX: number;
    baseY: number;
    baseZ: number;
    offset: number;
    drift: number;
    speed: number;
  };
  const smokeBeads: SmokeBead[] = [];
  const smokeOrigins = [
    { x: 0, y: 3.25, z: 0, count: 5 },
    { x: 0.7, y: 2.35, z: 0.5, count: 4 },
  ];
  smokeOrigins.forEach((origin, originIdx) => {
    for (let i = 0; i < origin.count; i++) {
      const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), smokeMat.clone());
      smoke.castShadow = false;
      add(smoke);
      smokeBeads.push({
        mesh: smoke,
        baseX: origin.x,
        baseY: origin.y,
        baseZ: origin.z,
        offset: i / origin.count,
        drift: (originIdx * 2 + i) * 1.1,
        speed: 0.18 + originIdx * 0.02 + i * 0.01,
      });
    }
  });

  const tankPositions: [number, number, number][] = [
    [0.5, 0.35, -1.5],
    [1.4, 0.35, -1.5],
    [0.5, 0.35, -0.6],
    [1.4, 0.35, -0.6],
  ];
  tankPositions.forEach(([x, y, z]) => {
    add(cy(0.4, 0.7, cream, x, y - 0.35, z, 32));
    add(cy(0.42, 0.035, yellow, x, y + 0.03, z, 32));
    const logoTex = makeSignTexture('S-OIL', '#0b5a35', '#ffffff');
    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.16),
      new THREE.MeshStandardMaterial({ map: logoTex, side: THREE.DoubleSide }),
    );
    logo.position.set(x, y + 0.04, z - 0.405);
    add(logo);
  });

  addPipe(0.95, 0.8, -1.5, 1.0, 'x');
  addPipe(0.95, 0.8, -0.6, 1.0, 'x');
  addPipe(0.55, 0.78, -0.25, 1.25, 'tilt');

  const gasStation = createGasStation(1.35, 0.7);

  cbx(0.32, 0.28, 0.32, green, -0.9, 0.24, 1.2);
  const truckTank = add(cy(0.18, 0.75, cream, -0.45, 0.1, 1.2, 16));
  truckTank.rotation.z = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const w = add(cy(0.055, 0.05, road, -0.85 + i * 0.22, 0.105, 1.4, 12));
    w.rotation.x = Math.PI / 2;
  }

  createTree(-2.0, 0.9, 0.55);
  createTree(-1.95, -1.45, 0.45);
  createTree(1.95, 0.88, 0.45);
  createTree(1.95, -1.65, 0.42);
  cbx(0.3, 0.12, 0.2, cream, -2.05, 0.13, 0.5);

  const buildingLight = new THREE.PointLight(0xfff2c8, 0.7, 3.5);
  buildingLight.position.set(hqX, 1.2, hqZ);
  add(buildingLight);

  type OilBead = { mesh: THREE.Mesh; phaseOffset: number };
  type OilPath = { start: THREE.Vector3; end: THREE.Vector3; beads: OilBead[]; speed: number };
  const oilPaths: OilPath[] = [];

  const addOilPath = (start: [number, number, number], end: [number, number, number], count: number, speed: number) => {
    const beads: OilBead[] = [];
    for (let i = 0; i < count; i++) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), oilDropMat.clone());
      bead.castShadow = false;
      add(bead);
      beads.push({ mesh: bead, phaseOffset: i / count });
    }
    oilPaths.push({ start: new THREE.Vector3(...start), end: new THREE.Vector3(...end), beads, speed });
  };

  addOilPath([0, 0.8, 0], [0.5, 0.8, -1.45], 5, 0.4);
  addOilPath([0, 0.8, 0], [1.4, 0.8, -1.45], 4, 0.35);
  addOilPath([0, 0.8, 0], [0.5, 0.8, -0.6], 4, 0.45);
  addOilPath([0, 0.8, 0], [1.4, 0.8, -0.6], 4, 0.38);

  root.userData.tick = (t: number) => {
    oilPaths.forEach((path) => {
      path.beads.forEach((b) => {
        const progress = ((t * path.speed) + b.phaseOffset) % 1;
        const pos = new THREE.Vector3().lerpVectors(path.start, path.end, progress);
        b.mesh.position.copy(pos);
        b.mesh.position.y += Math.sin(t * 8 + b.phaseOffset * 10) * 0.015;
        (b.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.3 + 0.15 * Math.sin(t * 3 + b.phaseOffset * 6);
      });
    });

    smokeBeads.forEach((s) => {
      const progress = ((t * s.speed) + s.offset) % 1;
      s.mesh.position.set(
        s.baseX + Math.sin(t * 0.8 + s.drift) * 0.1 + progress * 0.15,
        s.baseY + progress * 1.4,
        s.baseZ + Math.cos(t * 0.8 + s.drift) * 0.1,
      );
      (s.mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - progress);
      s.mesh.scale.setScalar(0.6 + progress * 1.5);
    });

    frontWindows.forEach((fw) => {
      const wave = 0.5 + 0.6 * Math.max(0, Math.sin(t * 1.2 - fw.row * 0.3 + fw.col * 0.1));
      (fw.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = wave;
    });

    dishPivot.rotation.y = t * 0.5;
    (dishLed.material as THREE.MeshBasicMaterial).color.setHSL(0, 1, 0.5 + 0.25 * Math.sin(t * 8));

    gasStation.canopyLight.intensity = 0.6 + 0.1 * Math.sin(t * 1.2);
    gasStation.headlights.forEach((h, i) => {
      h.material.color.setRGB(1, 0.97 + 0.03 * Math.sin(t * 4 + i), 0.75);
    });
  };

  return root;
}

// ── LG Energy Solution: battery factory ──────────────────────────────────────
export function createLGEnergySolution(): THREE.Group {
  const wall = mat(0xd0d8e0);
  const roof = mat(0x3a5a7a, 0.6, 0.15);
  const glass = mat(0x2a5a8a, 0.1, 0.12);
  const dark = mat(0x1a2a3a);
  const lgRed = mat(0xcc0000, 0.45, 0.05);
  return grp(
    bx(gx(4.2), 0.2,  gx(3.8), mat(0x6a7a8a), 0,     0,    0),   // slab
    bx(4.0, 2.0,  3.6, wall,          0,     0.2,  0),   // factory body
    bx(4.0, 0.2,  3.6, roof,          0,     2.2,  0),   // main roof
    bx(1.6, 1.2,  1.5, mat(0xc0c8d4), -1.0,  0.2,  1.1), // front annex
    bx(1.6, 0.18, 1.5, dark,          -1.0,  1.4,  1.1), // annex roof
    bx(4.0, 0.28, 0.05, glass,         0,    1.15, 1.82), // window hi
    bx(4.0, 0.28, 0.05, glass,         0,    0.55, 1.82), // window lo
    bx(0.55, 0.08, 3.6, lgRed,         1.75,  2.2,  0),   // roof rail R
    bx(0.55, 0.08, 3.6, lgRed,        -1.75,  2.2,  0),   // roof rail L
    cy(0.11, 1.0, dark,                1.3,   2.4,  -0.8, 6), // vent A
    cy(0.11, 1.0, dark,                1.3,   2.4,   0.8, 6), // vent B
  );
}

// ── Hyundai Motor: auto assembly plant ───────────────────────────────────────
export function createHyundaiMotor(): THREE.Group {
  const body   = mat(0xa8b8c0);
  const roof   = mat(0x607080, 0.55, 0.2);
  const dark   = mat(0x384858);
  const glass  = mat(0x4a90b4, 0.1);
  const blue   = mat(0x003087, 0.4, 0.1); // Hyundai blue
  return grp(
    bx(gx(4.2), 0.18, gx(3.8), mat(0x707888), 0,     0,    0),   // base
    bx(4.0, 1.8,  3.5, body,          0,     0.18, 0),   // main hall
    bx(4.0, 0.22, 3.5, roof,          0,     1.98, 0),   // roof A
    bx(1.6, 0.75, 3.5, body,         -2.9,   0.18, 0),   // side ext
    bx(1.6, 0.15, 3.5, roof,         -2.9,   0.93, 0),   // side roof
    bx(1.5, 1.2,  1.0, mat(0xb8c8d0), 1.2,   0.18, 1.3), // office block
    bx(1.5, 0.18, 1.0, dark,          1.2,   1.38, 1.3), // office roof
    bx(1.5, 0.35, 0.05, glass,        1.2,   0.75, 1.81), // office window
    bx(3.8, 0.3,  0.06, blue,         0,     1.0,  1.77), // blue accent stripe
    cy(0.14, 2.5, dark,              -1.0,   1.98, -0.5, 6), // chimney A
    cy(0.14, 2.5, dark,               0.4,   1.98, -0.5, 6), // chimney B
    cy(0.12, 2.0, dark,               1.5,   1.98, -0.5, 6), // chimney C
  );
}

// ── Samsung Biologics: pharma lab campus ─────────────────────────────────────
export function createSamsungBiologics(): THREE.Group {
  const white = mat(0xf0f4f8, 0.45, 0.05);
  const bglass = mat(0x4a90c4, 0.08, 0.12);
  const gray  = mat(0xbcc8d4, 0.6);
  const acc   = mat(0x1a5a9a, 0.4, 0.1);
  return grp(
    bx(gx(3.5), 0.3,  gx(3.5), gray,          0,     0,    0),   // base slab
    bx(3.0, 2.2,  3.0, white,         0,     0.3,  0),   // main lab block
    bx(3.0, 0.2,  3.0, gray,          0,     2.5,  0),   // roof
    bx(1.2, 1.4,  3.0, bglass,       -2.1,   0.3,  0),   // glass wing
    bx(1.2, 0.18, 3.0, acc,          -2.1,   1.7,  0),   // wing roof
    bx(3.0, 0.28, 0.05, bglass,       0,     1.55, 1.52), // window hi
    bx(3.0, 0.28, 0.05, bglass,       0,     0.8,  1.52), // window lo
    cy(0.55, 0.45, gray,              1.0,   2.7,  0,   16), // dome mech
    cy(0.38, 0.35, white,             1.0,   3.15, 0,   16), // dome top
    bx(0.25, 0.06, 3.0, acc,         -2.1,   1.45, 1.52), // wing win accent
  );
}

// ── Tesla: Business Model Diorama (TSLA) ────────────────
export { createTesla } from './teslaCampus';

// ── Apple Campus: Value Chain Diorama (AAPL) ─────────────────────────────────
export { createAppleCampus } from './appleCampus';

// ── Amazon: fulfillment warehouse ─────────────────────────────────────────────
export function createAmazonWarehouse(): THREE.Group {
  const body   = mat(0xd8c8a0);
  const roof   = mat(0x888070, 0.6);
  const orange = mat(0xff9900, 0.45, 0.05);
  const dark   = mat(0x3a3028, 0.75);
  const parapet = mat(0x706850, 0.6);
  return grp(
    bx(gx(4.5), 0.15, gx(4.0), mat(0x686050), 0,     0,    0),   // slab
    bx(4.2, 2.0,  3.8, body,          0,     0.15, 0),   // warehouse
    bx(4.2, 0.2,  3.8, roof,          0,     2.15, 0),   // flat roof
    bx(4.2, 0.14, 3.8, parapet,       0,     2.35, 0),   // parapet
    bx(4.2, 0.38, 0.06, orange,       0,     1.3,  1.92), // orange stripe
    bx(0.65, 0.75, 0.65, dark,       -1.5,   0.15, 2.05), // dock A
    bx(0.65, 0.75, 0.65, dark,        0,     0.15, 2.05), // dock B
    bx(0.65, 0.75, 0.65, dark,        1.5,   0.15, 2.05), // dock C
    bx(1.2, 1.1,  0.85, mat(0xc8b890), 1.5,  0.15, -3.0), // office block
    bx(1.2, 0.18, 0.85, dark,          1.5,  1.25, -3.0), // office roof
    cy(0.16, 0.55, dark,               0.5,  2.35,  0.5, 6), // vent A
    cy(0.16, 0.55, dark,              -0.5,  2.35, -0.5, 6), // vent B
  );
}

// ── Google: 1셀 슬림 v2 · Maps Pin + Cloud Edition (GOOGL) ──
export function createGoogleDC(): THREE.Group {
  const googleBlue = new THREE.MeshStandardMaterial({
    color: 0x4285f4,
    roughness: 0.4,
    metalness: 0.15,
    emissive: 0x1a5fff,
    emissiveIntensity: 0.15,
  });
  const googleRed = new THREE.MeshStandardMaterial({
    color: 0xea4335,
    roughness: 0.4,
    metalness: 0.1,
    emissive: 0xc01b1b,
    emissiveIntensity: 0.15,
  });
  const googleYellow = new THREE.MeshStandardMaterial({
    color: 0xfbbc04,
    roughness: 0.4,
    metalness: 0.1,
    emissive: 0xc08a00,
    emissiveIntensity: 0.2,
  });
  const googleGreen = new THREE.MeshStandardMaterial({
    color: 0x34a853,
    roughness: 0.4,
    metalness: 0.1,
    emissive: 0x1e7a35,
    emissiveIntensity: 0.15,
  });
  const youtubeRed = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.25,
    metalness: 0.1,
    emissive: 0xff0000,
    emissiveIntensity: 0.4,
  });
  const androidGreen = new THREE.MeshStandardMaterial({
    color: 0x3ddc84,
    roughness: 0.3,
    metalness: 0.15,
    emissive: 0x1ea862,
    emissiveIntensity: 0.3,
  });
  const whiteAccent = mat(0xffffff, 0.6);
  const silver = mat(0xcfd4dc, 0.42, 0.35);
  const metal = mat(0x999999, 0.4, 0.65);
  const darkMetal = mat(0x555555, 0.3, 0.8);
  const glass = new THREE.MeshStandardMaterial({
    color: 0xa0c8f5,
    roughness: 0.12,
    metalness: 0.1,
    transparent: true,
    opacity: 0.5,
    emissive: 0x3a78d0,
    emissiveIntensity: 0.15,
  });
  const glassDark = mat(0x1a2a3a, 0.2, 0.5);
  const warmWindow = new THREE.MeshStandardMaterial({
    color: 0xfff2c8,
    roughness: 0.35,
    emissive: 0xffb93d,
    emissiveIntensity: 0.65,
  });
  const basePlinth = mat(0x0f1620, 0.55);
  const platform = mat(0xdadee5, 0.78);
  const road = mat(0x1e242a, 0.82);
  const grass = mat(0x4a8c52, 0.9);
  const trunkBrown = mat(0x5a3a20, 0.8);
  const serverRackMat = mat(0x1a1a1a, 0.3, 0.7);
  const serverLed = new THREE.MeshStandardMaterial({
    color: 0x4285f4,
    emissive: 0x4285f4,
    emissiveIntensity: 2.5,
  });
  const mapDataLine = new THREE.MeshStandardMaterial({
    color: 0x4285f4,
    emissive: 0x4285f4,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.6,
  });
  const solarPanelMat = new THREE.MeshStandardMaterial({
    color: 0x1a2a4a,
    roughness: 0.25,
    metalness: 0.6,
    emissive: 0x2a5aaa,
    emissiveIntensity: 0.4,
  });
  const skyBeamYt = new THREE.MeshBasicMaterial({ color: 0xff3344, transparent: true, opacity: 0.3 });
  const globeMat = new THREE.MeshStandardMaterial({
    color: 0x1a4d8a,
    emissive: 0x3a78ff,
    emissiveIntensity: 0.6,
    roughness: 0.4,
    metalness: 0.3,
  });

  const root = new THREE.Group();
  const add = (o: THREE.Object3D) => {
    root.add(o);
    return o;
  };
  const cbx = (sx: number, sy: number, sz: number, m: THREE.Material, x: number, y: number, z: number) =>
    add(bx(sx, sy, sz, m, x, y - sy / 2, z)) as THREE.Mesh;

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const makeGoogleLogoTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 14, 14, canvas.width - 28, canvas.height - 28, 32);
    ctx.fill();
    const text = 'Google';
    const colors = ['#4285f4', '#ea4335', '#fbbc04', '#4285f4', '#34a853', '#ea4335'];
    ctx.font = 'bold 160px Arial, sans-serif';
    ctx.textBaseline = 'middle';
    const widths = text.split('').map(c => ctx.measureText(c).width);
    const totalW = widths.reduce((a, b) => a + b, 0);
    let xPos = canvas.width / 2 - totalW / 2;
    const yPos = canvas.height / 2;
    for (let i = 0; i < text.length; i++) {
      ctx.fillStyle = colors[i]!;
      ctx.textAlign = 'left';
      ctx.fillText(text[i]!, xPos, yPos);
      xPos += widths[i]!;
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeYouTubeLogoTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 48);
    ctx.fill();
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 4;
    roundRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 48);
    ctx.stroke();

    const cy = canvas.height / 2;
    ctx.fillStyle = '#ff0000';
    roundRect(ctx, 72, cy - 72, 144, 144, 28);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(130, cy - 38);
    ctx.lineTo(130, cy + 38);
    ctx.lineTo(188, cy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#282828';
    ctx.font = 'bold 130px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('YouTube', 260, cy);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeGoogleCloudLogoTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 32);
    ctx.fill();

    const cy = canvas.height / 2;
    ctx.fillStyle = '#4285f4';
    ctx.beginPath();
    ctx.arc(180, cy - 10, 48, 0, Math.PI * 2);
    ctx.arc(240, cy - 24, 56, 0, Math.PI * 2);
    ctx.arc(300, cy - 8, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4285f4';
    ctx.font = 'bold 88px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Google Cloud', 380, cy);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeYouTubeThumbnailTexture = (idx: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const gradients: [string, string][] = [
      ['#1a3a8a', '#0a2050'],
      ['#8a2a3a', '#502010'],
      ['#3a6a3a', '#1a4020'],
    ];
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, gradients[idx % 3]![0]);
    grad.addColorStop(1, gradients[idx % 3]![1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ccx = canvas.width / 2;
    const ccy = canvas.height / 2;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.85)';
    roundRect(ctx, ccx - 50, ccy - 35, 100, 70, 18);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(ccx - 16, ccy - 20);
    ctx.lineTo(ccx - 16, ccy + 20);
    ctx.lineTo(ccx + 22, ccy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, canvas.width - 100, canvas.height - 50, 80, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    const times = ['12:34', '8:45', '15:02'];
    ctx.fillText(times[idx % 3]!, canvas.width - 60, canvas.height - 30);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeSimpleSign = (text: string, bg: string, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bg;
    roundRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 24);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    roundRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 24);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 110px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const planeWith = (texture: THREE.Texture, x: number, y: number, z: number, w: number, h: number, emissiveStrength = 0.3) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.4,
        emissive: 0xffffff,
        emissiveMap: texture,
        emissiveIntensity: emissiveStrength,
      }),
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    return mesh;
  };

  const createAndroidHead = (x: number, y: number, z: number, scale = 1) => {
    const aGroup = new THREE.Group();
    aGroup.position.set(x, y, z);
    aGroup.scale.setScalar(scale);
    add(aGroup);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      androidGreen,
    );
    head.castShadow = true;
    aGroup.add(head);

    const headBase = new THREE.Mesh(new THREE.CircleGeometry(0.18, 24), androidGreen);
    headBase.rotation.x = Math.PI / 2;
    aGroup.add(headBase);

    [-0.06, 0.06].forEach(ox => {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), androidGreen);
      ant.position.set(ox, 0.2, 0);
      ant.rotation.z = ox > 0 ? Math.PI / 8 : -Math.PI / 8;
      aGroup.add(ant);
    });

    [-0.06, 0.06].forEach(ox => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      );
      eye.position.set(ox, 0.07, 0.16);
      aGroup.add(eye);
    });

    return aGroup;
  };

  const createServerRack = (x: number, y: number, z: number) => {
    const rack = new THREE.Group();
    rack.position.set(x, y, z);
    add(rack);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.18), serverRackMat);
    body.castShadow = body.receiveShadow = true;
    rack.add(body);

    const leds: { mesh: THREE.Mesh; phase: number }[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.005), serverLed.clone());
        led.position.set(-0.06 + col * 0.06, 0.2 - row * 0.1, 0.095);
        rack.add(led);
        leds.push({ mesh: led, phase: (row * 3 + col) * 0.15 });
      }
    }
    return { group: rack, leds };
  };

  const createTree = (x: number, z: number, s = 0.5) => {
    add(cy(0.035, 0.38 * (s / 0.5), mat(0x7a4b2a, 0.8), x, 0.04 * (s / 0.5), z, 10));
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.18 * (s / 0.5), 18, 12), grass);
    crown.position.set(x, 0.52 * (s / 0.5), z);
    crown.castShadow = crown.receiveShadow = true;
    add(crown);
  };

  const addSphere = (r: number, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    return add(mesh) as THREE.Mesh;
  };

  const createMapsPin = (x: number, y: number, z: number, scale = 1) => {
    const pinGroup = new THREE.Group();
    pinGroup.position.set(x, y, z);
    pinGroup.scale.setScalar(scale);
    add(pinGroup);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.14, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    pinGroup.add(shadow);

    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xea4335,
      roughness: 0.35,
      emissive: 0xea4335,
      emissiveIntensity: 0.35,
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 16), pinMat);
    cone.position.y = 0.09;
    cone.castShadow = true;
    pinGroup.add(cone);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), pinMat);
    head.position.y = 0.22;
    head.castShadow = true;
    pinGroup.add(head);

    const pinColors = [0x4285f4, 0xea4335, 0xfbbc04, 0x34a853];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.012, 8, 12, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: pinColors[i]!, emissive: pinColors[i]!, emissiveIntensity: 0.5 }),
      );
      arc.rotation.x = Math.PI / 2;
      arc.rotation.z = angle;
      arc.position.set(Math.cos(angle) * 0.2, 0.02, Math.sin(angle) * 0.2);
      pinGroup.add(arc);
    }

    return pinGroup;
  };

  // ── Base ──
  cbx(gx(4.8), 0.26, gx(4.3), basePlinth, 0, -0.13, 0);
  cbx(gx(4.35), 0.12, gx(3.85), platform, 0, 0.02, 0);
  cbx(gx(4.0), 0.04, gx(0.62), road, 0, 0.105, 1.36);
  cbx(0.4, 0.04, 1.8, road, -1.5, 0.11, -1.2);
  cbx(0.4, 0.04, 1.8, road, 1.5, 0.11, -1.2);
  for (const ox of [-1.1, -0.9, -0.7]) {
    cbx(0.08, 0.012, 0.5, whiteAccent, ox, 0.135, 1.36);
  }

  // ── Googleplex HQ ──
  cbx(1.8, 2.0, 1.4, whiteAccent, 0, 1.0, -0.5);
  cbx(1.85, 0.06, 1.45, grass, 0, 2.04, -0.5);

  const rooftopTrees: [number, number][] = [
    [-0.7, -0.9],
    [-0.3, -0.9],
    [0.3, -0.9],
    [0.7, -0.9],
    [-0.5, -0.1],
    [0.5, -0.1],
  ];
  rooftopTrees.forEach(([rx, rz]) => {
    add(cy(0.02, 0.08, trunkBrown, rx, 2.09, -0.5 + rz, 8));
    addSphere(0.08, grass, rx, 2.22, -0.5 + rz);
  });

  cbx(1.85, 0.04, 0.01, googleBlue, 0, 0.55, 0.205);
  cbx(1.85, 0.04, 0.01, googleRed, 0, 0.9, 0.205);
  cbx(1.85, 0.04, 0.01, googleYellow, 0, 1.25, 0.205);
  cbx(1.85, 0.04, 0.01, googleGreen, 0, 1.6, 0.205);

  const winCols = 8;
  const winRows = 6;
  const winW = 0.16;
  const winH = 0.22;
  const winGapX = 0.04;
  const winGapY = 0.06;
  const totalW = winCols * winW + (winCols - 1) * winGapX;
  const totalH = winRows * winH + (winRows - 1) * winGapY;
  const startX = 0 - totalW / 2 + winW / 2;
  const startY = 1.0 - totalH / 2 + winH / 2;

  const floorWindows: { mesh: THREE.Mesh; row: number; col: number }[] = [];
  for (let row = 0; row < winRows; row++) {
    for (let col = 0; col < winCols; col++) {
      const wx = startX + col * (winW + winGapX);
      const wy = startY + row * (winH + winGapY);
      floorWindows.push({
        mesh: cbx(winW, winH, 0.02, warmWindow.clone(), wx, wy, 0.215),
        row,
        col,
      });
    }
  }

  cbx(0.03, 2.0, 1.3, glass, -0.91, 1.0, -0.5);
  cbx(0.03, 2.0, 1.3, glass, 0.91, 1.0, -0.5);
  cbx(1.4, 0.3, 0.04, glassDark, 0, 0.2, 0.22);
  cbx(1.5, 0.04, 0.2, whiteAccent, 0, 0.4, 0.32);

  const googleLogoBig = add(planeWith(makeGoogleLogoTexture(), 0, 1.5, 0.215, 1.4, 0.34, 0.45));
  const googleLogoSmall = add(planeWith(makeGoogleLogoTexture(), 0, 0.32, 0.243, 0.7, 0.18, 0.4));

  // ── Rooftop sign: Google 4-color ──
  const rooftopGoogleSign = add(planeWith(makeGoogleLogoTexture(), 0, 2.55, 0.1, 1.5, 0.56, 0.5));
  rooftopGoogleSign.rotation.x = -Math.PI / 9;
  cbx(0.04, 0.4, 0.04, darkMetal, -0.5, 2.3, 0.05);
  cbx(0.04, 0.4, 0.04, darkMetal, 0.5, 2.3, 0.05);

  // ── Cloud building (enhanced) ──
  cbx(0.9, 1.0, 1.4, silver, 1.5, 0.5, -0.5);
  cbx(0.95, 0.08, 1.45, googleBlue, 1.5, 0.96, -0.5);

  const cloudSign = add(planeWith(makeGoogleCloudLogoTexture(), 1.96, 0.55, -0.5, 0.55, 0.22, 0.35));
  cloudSign.rotation.y = -Math.PI / 2;

  const cloudDishPivot = new THREE.Group();
  cloudDishPivot.position.set(1.5, 1.0, -0.5);
  add(cloudDishPivot);
  const cloudDishMount = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), darkMetal);
  cloudDishMount.position.y = 0.1;
  cloudDishPivot.add(cloudDishMount);
  const cloudDish = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.2),
    silver,
  );
  cloudDish.rotation.x = Math.PI;
  cloudDish.position.y = 0.22;
  cloudDishPivot.add(cloudDish);
  const cloudDishAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8), darkMetal);
  cloudDishAntenna.position.y = 0.38;
  cloudDishPivot.add(cloudDishAntenna);
  const cloudDishLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0x4285f4 }),
  );
  cloudDishLed.position.y = 0.52;
  cloudDishPivot.add(cloudDishLed);

  const solarPanels: THREE.Mesh[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      solarPanels.push(
        cbx(0.12, 0.02, 0.18, solarPanelMat, 1.5 - 0.27 + col * 0.18, 1.02, -0.5 - 0.27 + row * 0.18),
      );
    }
  }

  const serverRacks: { group: THREE.Group; leds: { mesh: THREE.Mesh; phase: number }[] }[] = [];
  for (const dz of [-0.4, 0, 0.4]) {
    serverRacks.push(createServerRack(1.5, 1.35, -0.5 + dz));
  }

  add(cy(0.08, 0.3, darkMetal, 1.3, 0.85, -1.1, 16));
  add(cy(0.1, 0.05, silver, 1.3, 1.145, -1.1, 16));
  add(cy(0.08, 0.3, darkMetal, 1.7, 0.85, -1.1, 16));
  add(cy(0.1, 0.05, silver, 1.7, 1.145, -1.1, 16));
  cbx(0.8, 0.6, 0.03, glass, 1.5, 0.5, 0.21);

  const dataFlowLines: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    dataFlowLines.push(
      cbx(0.02, 0.5, 0.02, mapDataLine.clone(), 1.5 - 0.32 + i * 0.16, 0.5, 0.21),
    );
  }

  add(cy(0.04, 0.4, darkMetal, 1.92, 0, -0.5, 8));
  add(cy(0.025, 0.3, darkMetal, 1.92, 0.4, -0.5, 8));
  add(cy(0.015, 0.2, darkMetal, 1.92, 0.7, -0.5, 8));
  const commLed = addSphere(
    0.02,
    new THREE.MeshBasicMaterial({ color: 0x34a853 }),
    1.92,
    0.85,
    -0.5,
  );

  const mapsPin = createMapsPin(1.85, 1.1, 0.8, 1.0);

  // ── Android building ──
  cbx(0.9, 0.8, 1.4, whiteAccent, -1.5, 0.4, -0.5);
  cbx(0.95, 0.06, 1.45, androidGreen, -1.5, 0.82, -0.5);
  createAndroidHead(-1.5, 0.85, -0.5, 0.9);
  cbx(0.8, 0.5, 0.03, glassDark, -1.5, 0.4, 0.21);

  const appIcons: { text: string; bg: string; color: string; x: number }[] = [
    { text: 'YT', bg: '#ff0000', color: '#ffffff', x: -1.8 },
    { text: 'M', bg: '#ea4335', color: '#ffffff', x: -1.6 },
    { text: 'G', bg: '#4285f4', color: '#ffffff', x: -1.4 },
    { text: 'P', bg: '#34a853', color: '#ffffff', x: -1.2 },
  ];
  appIcons.forEach(app => {
    add(planeWith(makeSimpleSign(app.text, app.bg, app.color), app.x, 0.4, 0.225, 0.12, 0.12, 0.4));
  });

  const andSign = add(planeWith(makeSimpleSign('Android', '#ffffff', '#3ddc84'), -1.96, 0.5, -0.5, 0.5, 0.18, 0.3));
  andSign.rotation.y = Math.PI / 2;

  // ── YouTube front thumbnails ──
  const ytThumbs: THREE.Mesh[] = [];
  const thumbSpecs = [
    { x: -0.9, rotY: Math.PI / 12 },
    { x: -0.3, rotY: 0 },
    { x: 0.3, rotY: -Math.PI / 12 },
  ];
  thumbSpecs.forEach((spec, i) => {
    const thumb = add(planeWith(makeYouTubeThumbnailTexture(i), spec.x, 0.55, 0.55, 0.45, 0.28, 0.6));
    thumb.rotation.y = spec.rotY;
    ytThumbs.push(thumb);
    cbx(0.04, 0.18, 0.04, darkMetal, spec.x, 0.35, 0.55);
  });

  const ytBeam = add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.15, 3.5, 12, 1, true), skyBeamYt),
  ) as THREE.Mesh;
  ytBeam.position.set(0, 4.4, 0.1);
  ytBeam.castShadow = false;

  // ── Logo cubes ──
  const logoCubes: { mesh: THREE.Mesh; phase: number }[] = [];
  const cubeColors = [googleBlue, googleRed, googleYellow, googleGreen];
  const cubePositions: [number, number][] = [
    [-0.18, 0.18],
    [0.18, 0.18],
    [-0.18, -0.18],
    [0.18, -0.18],
  ];
  cubePositions.forEach(([px, pz], i) => {
    logoCubes.push({
      mesh: cbx(0.1, 0.1, 0.1, cubeColors[i]!, px + 0.5, 0.28, 1.05 + pz * 0.5),
      phase: i * 0.5,
    });
  });

  // ── Satellite dish + globe ──
  const dishPivot = new THREE.Group();
  dishPivot.position.set(-0.4, 1.4, -1.6);
  add(dishPivot);
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.2),
    silver,
  );
  dish.rotation.x = Math.PI;
  dishPivot.add(dish);
  const dishAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), darkMetal);
  dishAntenna.position.set(0, 0.13, 0);
  dishPivot.add(dishAntenna);
  const dishLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xff3355 }),
  );
  dishLed.position.set(0, 0.26, 0);
  dishPivot.add(dishLed);

  const globe = add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), globeMat)) as THREE.Mesh;
  globe.position.set(0.4, 0.25, -1.6);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    addSphere(
      0.012,
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      0.4 + Math.cos(angle) * 0.135,
      0.25 + (i % 2) * 0.05,
      -1.6 + Math.sin(angle) * 0.135,
    );
  }

  // ── Waymo car ──
  const waymoCar = new THREE.Group();
  waymoCar.position.set(-0.5, 0.18, 1.3);
  add(waymoCar);
  const waymoBody = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.13), whiteAccent);
  waymoBody.castShadow = waymoBody.receiveShadow = true;
  waymoCar.add(waymoBody);
  const waymoRoof = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.12), whiteAccent);
  waymoRoof.position.set(0, 0.07, 0);
  waymoRoof.castShadow = waymoRoof.receiveShadow = true;
  waymoCar.add(waymoRoof);
  const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 12), darkMetal);
  lidar.position.set(0, 0.13, 0);
  lidar.castShadow = true;
  waymoCar.add(lidar);
  [[-0.05, 0.13], [0.05, 0.13]].forEach(([hx, hz]) => {
    const hl = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xfff8c0 }),
    );
    hl.position.set(hx, 0, hz);
    waymoCar.add(hl);
  });

  // ── Google truck ──
  cbx(0.32, 0.28, 0.32, googleBlue, 0.6, 0.24, 1.3);
  cbx(0.58, 0.34, 0.34, whiteAccent, 0.97, 0.28, 1.3);
  add(planeWith(makeGoogleLogoTexture(), 0.97, 0.3, 1.48, 0.4, 0.12, 0.3));

  // ── People ──
  const peopleColors = [0xea4335, 0xfbbc04, 0x34a853, 0x4285f4, 0xffffff];
  for (let i = 0; i < 8; i++) {
    const px = -1.0 + (i % 4) * 0.35;
    const pz = 0.85 + Math.floor(i / 4) * 0.15;
    const person = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.1, 0.04),
      mat(peopleColors[i % peopleColors.length]!, 0.7),
    );
    person.position.set(px, 0.18, pz);
    person.castShadow = true;
    add(person);
  }

  // ── Trees ──
  createTree(-2.0, -1.6, 0.45);
  createTree(2.0, -1.85, 0.42);
  createTree(0.0, -1.95, 0.42);

  // ── Lights ──
  const heroGlow = new THREE.PointLight(0xfff2c8, 0.7, 3.5);
  heroGlow.position.set(0, 1.0, -0.5);
  add(heroGlow);
  const rooftopSignGlow = new THREE.PointLight(0xfff4e8, 0.75, 3);
  rooftopSignGlow.position.set(0, 2.3, 0.3);
  add(rooftopSignGlow);
  const mapsGlow = new THREE.PointLight(0xea4335, 0.55, 2.5);
  mapsGlow.position.set(1.85, 1.1, 0.8);
  add(mapsGlow);
  const cloudGlow = new THREE.PointLight(0x4285f4, 0.8, 3);
  cloudGlow.position.set(1.5, 0.8, -0.5);
  add(cloudGlow);
  const androidGlow = new THREE.PointLight(0x3ddc84, 0.5, 2);
  androidGlow.position.set(-1.5, 0.8, -0.5);
  add(androidGlow);

  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;

    floorWindows.forEach(fw => {
      const wave = 0.4 + 0.6 * Math.max(0, Math.sin(t * 1.2 - fw.row * 0.3 + fw.col * 0.1));
      (fw.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = wave;
    });

    ytThumbs.forEach((thumb, i) => {
      (thumb.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + 0.3 * Math.sin(t * 1.5 + i * 0.8);
    });

    (rooftopGoogleSign.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.4 + 0.3 * Math.sin(t * 1.0);
    rooftopSignGlow.intensity = 0.65 + 0.25 * Math.sin(t * 1.0);

    skyBeamYt.opacity = 0.25 + 0.15 * Math.sin(t * 1.5);
    ytBeam.scale.x = ytBeam.scale.z = 1 + 0.12 * Math.sin(t * 2);

    logoCubes.forEach(c => {
      c.mesh.position.y = 0.28 + Math.abs(Math.sin(t * 1.5 + c.phase)) * 0.04;
    });

    cloudDishPivot.rotation.y = t * 0.8;
    (cloudDishLed.material as THREE.MeshBasicMaterial).color.setHSL(0.58, 1, 0.5 + 0.25 * Math.sin(tRaw * 4));

    solarPanels.forEach((panel, i) => {
      (panel.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + 0.35 * Math.abs(Math.sin(t * 2 + i * 0.4));
    });

    dataFlowLines.forEach((line, i) => {
      const m = line.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.0 + 1.0 * Math.abs(Math.sin(t * 3 + i * 0.5));
      m.opacity = 0.35 + 0.35 * Math.abs(Math.sin(t * 2.5 + i * 0.35));
    });

    (commLed.material as THREE.MeshBasicMaterial).color.setHSL(
      0.35 + 0.05 * Math.sin(tRaw * 3),
      1,
      0.5,
    );

    mapsPin.position.y = 1.1 + Math.sin(t * 2) * 0.04;
    mapsPin.rotation.y = Math.sin(t * 0.8) * 0.08;
    mapsGlow.intensity = 0.45 + 0.2 * Math.sin(t * 2.2);

    dishPivot.rotation.y = t * 0.6;
    (dishLed.material as THREE.MeshBasicMaterial).color.setHSL(0, 1, 0.5 + 0.25 * Math.sin(tRaw * 4));

    globe.rotation.y = t * 0.8;

    serverRacks.forEach(rack => {
      rack.leds.forEach(led => {
        (led.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          1.5 + 1.5 * Math.abs(Math.sin(t * 4 + led.phase * 3));
      });
    });

    lidar.rotation.y = tRaw * 4;
    waymoCar.position.x = -0.5 + Math.sin(t * 0.5) * 0.8;

    cloudGlow.intensity = 0.7 + 0.15 * Math.sin(t * 2);

    root.rotation.y = Math.sin(t * 0.25) * 0.012;
  };

  return root;
}

// ── Bank of America: dark glass finance tower ─────────────────────────────────
export function createBankOfAmerica(): THREE.Group {
  const glass  = mat(0x1a3858, 0.08, 0.35);
  const frame  = mat(0x0a1828, 0.5, 0.45);
  const silver = mat(0x6a8aaa, 0.12, 0.4);
  return grp(
    bx(gx(2.8), 0.3,  gx(2.8), mat(0x1a2838, 0.7, 0.2), 0, 0),   // base
    bx(2.4, 0.55, 2.4, frame,  0, 0.3),  // lobby
    bx(2.0, 4.5,  2.0, glass,  0, 0.85), // tower body
    bx(1.6, 1.2,  1.6, silver, 0, 5.35), // upper setback
    bx(1.0, 0.9,  1.0, glass,  0, 6.55), // crown
    cy(0.06, 1.1, frame, 0, 7.45),       // spire
    bx(2.0, 0.06, 0.05, frame, 0, 1.7,  1.02), // band 1
    bx(2.0, 0.06, 0.05, frame, 0, 2.4,  1.02), // band 2
    bx(2.0, 0.06, 0.05, frame, 0, 3.1,  1.02), // band 3
    bx(2.0, 0.06, 0.05, frame, 0, 3.8,  1.02), // band 4
    bx(2.0, 0.06, 0.05, frame, 0, 4.5,  1.02), // band 5
    bx(2.0, 0.06, 0.05, frame, 0, 5.2,  1.02), // band 6
  );
}

// ── Alibaba: e-commerce HQ ────────────────────────────────────────────────────
export function createAlibaba(): THREE.Group {
  const wall   = mat(0xf0e8d8, 0.45);
  const orange = mat(0xff6a00, 0.38, 0.06);
  const glass  = mat(0x60a0c8, 0.08, 0.12);
  const dark   = mat(0x2a1808, 0.6);
  return grp(
    bx(gx(3.8), 0.22, gx(3.8), mat(0x7a6a5a), 0,     0,    0),   // base
    bx(3.2, 0.5,  3.2, mat(0xd0c0a0), 0,     0.22, 0),   // podium
    bx(2.4, 2.4,  2.4, wall,          0,     0.72, 0),   // main tower
    bx(2.4, 0.22, 2.4, orange,        0,     3.12, 0),   // orange top band
    bx(1.6, 1.2,  1.6, glass,         0,     3.34, 0),   // upper glass box
    bx(1.6, 0.18, 1.6, dark,          0,     4.54, 0),   // crown
    bx(2.4, 0.32, 0.05, glass,        0,     1.55, 1.22), // win hi
    bx(2.4, 0.32, 0.05, glass,        0,     0.9,  1.22), // win lo
    bx(1.5, 1.8,  0.65, mat(0xe8dcc8),-2.05, 0.22, 0),   // side wing
    bx(1.5, 0.18, 0.65, orange,       -2.05, 2.0,  0),   // wing top
    cy(0.06, 0.9, dark, 0, 4.72),                         // antenna
  );
}

// ── PDD Holdings: modern split-tower office ───────────────────────────────────
export function createPdd(): THREE.Group {
  const wall  = mat(0xe8eef4, 0.38);
  const pBlue = mat(0x2a5aaa, 0.28, 0.12);
  const glass = mat(0x7ab0e0, 0.08, 0.12);
  const dark  = mat(0x1a2a3a, 0.5, 0.2);
  return grp(
    bx(gx(3.5), 0.2,  gx(3.5), mat(0x5a6a7a), 0,    0,    0),   // base
    bx(3.2, 0.45, 3.2, dark,          0,    0.2,  0),   // podium
    bx(2.2, 3.2,  1.8, wall,          0,    0.65, 0),   // main slab tower
    bx(2.2, 0.2,  1.8, pBlue,         0,    3.85, 0),   // top cap
    bx(2.2, 3.2,  0.05, glass,        0,    0.65, 0.92), // glass facade
    bx(1.4, 1.8,  2.2, mat(0xd0dce8), 1.7,  0.65, 0),  // wing tower
    bx(1.4, 0.18, 2.2, pBlue,         1.7,  2.45, 0),  // wing cap
    bx(1.4, 1.8,  0.05, glass,        1.7,  0.65, 1.12), // wing facade
    bx(0.4, 0.08, 1.8, dark,          1.1,  2.63, 0),  // connecting beam
    cy(0.06, 1.0, dark, 0,    4.05),                     // main antenna
    cy(0.06, 0.7, dark, 1.3,  2.63),                     // wing antenna
  );
}
