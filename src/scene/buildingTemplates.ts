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

// ── Boeing: 1셀 슬림 v2 · Commercial + Defense Edition (BA) ──
export function createBoeing(): THREE.Group {
  const boeingBlue = new THREE.MeshStandardMaterial({
    color: 0x0033a0,
    roughness: 0.4,
    metalness: 0.15,
    emissive: 0x0a1f6a,
    emissiveIntensity: 0.1,
  });
  const boeingBlueLight = mat(0x3a6dd0, 0.4, 0.1);
  const defenseGray = mat(0x3a4048, 0.55, 0.35);
  const defenseAccent = new THREE.MeshStandardMaterial({
    color: 0x5fa3ff,
    roughness: 0.35,
    metalness: 0.25,
    emissive: 0x3a78d0,
    emissiveIntensity: 0.3,
  });
  const defenseDark = mat(0x1e242c, 0.65, 0.25);
  const white = mat(0xf4f4f4, 0.8);
  const whiteAccent = mat(0xffffff, 0.55);
  const grayLight = mat(0xcfd4dc, 0.65, 0.25);
  const grayMid = mat(0x888c95, 0.55, 0.35);
  const darkMetal = mat(0x555555, 0.3, 0.8);
  const metal = mat(0x999999, 0.55, 0.35);
  const glass = new THREE.MeshStandardMaterial({
    color: 0x9ec5f0,
    roughness: 0.12,
    metalness: 0.1,
    transparent: true,
    opacity: 0.55,
    emissive: 0x3a78d0,
    emissiveIntensity: 0.15,
  });
  const glassDark = mat(0x1a2a3a, 0.2, 0.5);
  const warmWindow = new THREE.MeshStandardMaterial({
    color: 0xfff2c8,
    roughness: 0.35,
    emissive: 0xffb93d,
    emissiveIntensity: 0.7,
  });
  const runwayAsphalt = mat(0x1e2226, 0.92);
  const runwayLine = mat(0xfffae0, 0.65);
  const runwayLight = new THREE.MeshStandardMaterial({
    color: 0xffd84a,
    roughness: 0.25,
    emissive: 0xffd84a,
    emissiveIntensity: 2.0,
  });
  const basePlinth = mat(0x0a121c, 0.55);
  const platform = mat(0x5a6068, 0.85);
  const grass = mat(0x4a8c52, 0.9);
  const aircraftBody = mat(0xf8f8fa, 0.35, 0.55);
  const aircraftAccent = mat(0x0033a0, 0.35, 0.35);
  const aircraftPrimer = mat(0xa8a850, 0.65, 0.2);
  const militaryBody = mat(0x2a3a25, 0.55, 0.3);
  const militaryDark = mat(0x1a2418, 0.55, 0.35);
  const conveyorBase = mat(0x3a3a45, 0.6, 0.4);
  const conveyorBelt = mat(0x1a1a22, 0.9);
  const workLightMat = new THREE.MeshBasicMaterial({ color: 0xfff8c0 });
  const defenseLightMat = new THREE.MeshBasicMaterial({ color: 0x5fa3ff });
  const roofLightMat = new THREE.MeshBasicMaterial({ color: 0x5fa3ff });
  const towerLightMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.85 });
  const hangarVoid = mat(0x0a0a0e);
  const securityRed = new THREE.MeshStandardMaterial({
    color: 0xff3344,
    emissive: 0xff3344,
    emissiveIntensity: 1.5,
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

  const makeBoeingLogoTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0033a0';
    ctx.font = 'bold 140px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOEING', canvas.width / 2, canvas.height / 2);
    ctx.strokeStyle = '#0033a0';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    const sx = 165;
    const sy = canvas.height / 2;
    ctx.beginPath();
    ctx.arc(sx, sy, 50, Math.PI * 0.7, Math.PI * 1.3, false);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeBoeingDefenseLogoTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1e242c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 88px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOEING DEFENSE', canvas.width / 2, 90);
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.fillStyle = '#5fa3ff';
    ctx.fillText('SPACE & SECURITY', canvas.width / 2, 175);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeRevenueBoardTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 10, 10, canvas.width - 20, canvas.height - 20, 20);
    ctx.fill();
    ctx.strokeStyle = '#0033a0';
    ctx.lineWidth = 5;
    roundRect(ctx, 10, 10, canvas.width - 20, canvas.height - 20, 20);
    ctx.stroke();
    ctx.fillStyle = '#0033a0';
    ctx.font = 'bold 38px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BOEING REVENUE', canvas.width / 2, 50);
    const cx = canvas.width / 2;
    const cyChart = 200;
    const radius = 80;
    ctx.fillStyle = '#0033a0';
    ctx.beginPath();
    ctx.moveTo(cx, cyChart);
    ctx.arc(cx, cyChart, radius, Math.PI / 2, Math.PI * 1.5, false);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a4048';
    ctx.beginPath();
    ctx.moveTo(cx, cyChart);
    ctx.arc(cx, cyChart, radius, Math.PI * 1.5, Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cyChart, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0033a0';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Commercial 50%', 50, 320);
    ctx.fillStyle = '#3a4048';
    ctx.textAlign = 'right';
    ctx.fillText('Defense 50%', canvas.width - 50, 320);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('50%', cx - 40, cyChart);
    ctx.fillText('50%', cx + 40, cyChart);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeFlagTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    const stripeH = canvas.height / 13;
    for (let i = 0; i < 13; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#bf0a30' : '#ffffff';
      ctx.fillRect(0, i * stripeH, canvas.width, stripeH);
    }
    ctx.fillStyle = '#002868';
    ctx.fillRect(0, 0, canvas.width * 0.4, stripeH * 7);
    ctx.fillStyle = '#ffffff';
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 6; c++) {
        ctx.beginPath();
        ctx.arc(15 + c * 20, 12 + r * 16, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
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

  const planeWith = (texture: THREE.Texture, x: number, y: number, z: number, w: number, h: number, emissiveStrength = 0.25) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.45,
        emissive: 0xffffff,
        emissiveMap: texture,
        emissiveIntensity: emissiveStrength,
      }),
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    return mesh;
  };

  const createAircraft = (x: number, y: number, z: number, type: 'complete' | 'primer' = 'complete', scale = 1) => {
    const ac = new THREE.Group();
    ac.position.set(x, y, z);
    ac.scale.setScalar(scale);
    add(ac);

    const bodyMat = type === 'complete' ? aircraftBody : aircraftPrimer;

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.6, 16), bodyMat);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.castShadow = true;
    ac.add(fuselage);

    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      bodyMat,
    );
    nose.position.set(0.8, 0, 0);
    nose.rotation.z = -Math.PI / 2;
    ac.add(nose);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 16), bodyMat);
    tail.position.set(-0.95, 0, 0);
    tail.rotation.z = -Math.PI / 2;
    ac.add(tail);

    if (type === 'complete') {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.025, 1.4), bodyMat);
      wing.position.set(0.05, -0.05, 0);
      wing.castShadow = true;
      ac.add(wing);
    }

    const hStab = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.55), bodyMat);
    hStab.position.set(-0.85, 0.02, 0);
    ac.add(hStab);

    const vStab = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.025), bodyMat);
    vStab.position.set(-0.85, 0.18, 0);
    ac.add(vStab);

    if (type === 'complete') {
      const blueBand = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.04), aircraftAccent);
      blueBand.position.set(0, 0.04, 0.105);
      ac.add(blueBand);
      const blueBand2 = blueBand.clone();
      blueBand2.position.z = -0.105;
      ac.add(blueBand2);

      [-0.35, 0.35].forEach(wz => {
        const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.22, 16), darkMetal);
        eng.rotation.z = Math.PI / 2;
        eng.position.set(0.05, -0.12, wz);
        ac.add(eng);
        const intake = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), mat(0x1a1a1a));
        intake.rotation.z = Math.PI / 2;
        intake.position.set(0.16, -0.12, wz);
        ac.add(intake);
      });

      for (let i = -7; i <= 7; i++) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.005), warmWindow.clone());
        win.position.set(i * 0.08, 0.02, 0.142);
        ac.add(win);
        const winBack = win.clone();
        winBack.position.z = -0.142;
        ac.add(winBack);
      }
    }

    return ac;
  };

  const createSeparateWing = (x: number, y: number, z: number, scale = 0.7) => {
    const wingGroup = new THREE.Group();
    wingGroup.position.set(x, y, z);
    wingGroup.scale.setScalar(scale);
    add(wingGroup);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.45), aircraftPrimer);
    wing.castShadow = true;
    wingGroup.add(wing);

    const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.18), aircraftPrimer);
    winglet.position.set(0.68, 0.08, 0);
    wingGroup.add(winglet);

    return wingGroup;
  };

  const createFighterJet = (x: number, y: number, z: number, scale = 1) => {
    const fj = new THREE.Group();
    fj.position.set(x, y, z);
    fj.scale.setScalar(scale);
    add(fj);

    const bodyMat = militaryBody;

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.18), bodyMat);
    body.castShadow = true;
    fj.add(body);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 12), bodyMat);
    nose.position.set(0.65, 0, 0);
    nose.rotation.z = -Math.PI / 2;
    fj.add(nose);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.14), bodyMat);
    tail.position.set(-0.58, 0, 0);
    fj.add(tail);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.9), bodyMat);
    wing.position.set(-0.05, -0.04, 0);
    fj.add(wing);

    [-0.06, 0.06].forEach(tz => {
      const vStab = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.018), bodyMat);
      vStab.position.set(-0.55, 0.11, tz);
      vStab.rotation.z = Math.PI / 16;
      fj.add(vStab);
    });

    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(0x1a1a2a, 0.1, 0.7),
    );
    canopy.position.set(0.25, 0.06, 0);
    canopy.scale.set(1.5, 1, 0.7);
    fj.add(canopy);

    [-0.05, 0.05].forEach(tz => {
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12), darkMetal);
      exhaust.rotation.z = Math.PI / 2;
      exhaust.position.set(-0.7, -0.01, tz);
      fj.add(exhaust);
    });

    [-0.35, 0.35].forEach(wz => {
      const missile = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.25, 8), militaryDark);
      missile.rotation.z = Math.PI / 2;
      missile.position.set(0, -0.07, wz);
      fj.add(missile);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.04, 8), militaryDark);
      tip.position.set(0.14, -0.07, wz);
      tip.rotation.z = -Math.PI / 2;
      fj.add(tip);
    });

    return fj;
  };

  const createTree = (x: number, z: number, s = 0.5) => {
    add(cy(0.035, 0.38 * (s / 0.5), mat(0x7a4b2a, 0.8), x, 0.04 * (s / 0.5), z, 10));
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.18 * (s / 0.5), 18, 12), grass);
    crown.position.set(x, 0.52 * (s / 0.5), z);
    crown.castShadow = crown.receiveShadow = true;
    add(crown);
  };

  // ── Base ──
  cbx(gx(4.8), 0.26, gx(4.3), basePlinth, 0, -0.13, 0);
  cbx(gx(4.35), 0.12, gx(3.85), platform, 0, 0.02, 0);

  // ── Commercial hangar (flat roof) ──
  cbx(2.4, 1.9, 1.7, whiteAccent, -0.4, 0.95, -0.8);
  cbx(2.5, 0.12, 1.8, grayLight, -0.4, 1.96, -0.8);
  cbx(2.52, 0.04, 1.82, boeingBlueLight, -0.4, 2.04, -0.8);

  const hvacPositions: [number, number][] = [
    [-1.2, -1.3], [-0.4, -1.3], [0.4, -1.3],
    [-1.2, -0.3], [-0.4, -0.3], [0.4, -0.3],
  ];
  hvacPositions.forEach(([hx, hz]) => {
    cbx(0.18, 0.1, 0.18, grayMid, hx, 2.1, hz);
  });

  cbx(2.1, 1.5, 0.1, hangarVoid, -0.4, 0.85, 0.075);
  add(planeWith(makeBoeingLogoTexture(), -0.4, 1.75, 0.06, 1.7, 0.34, 0.4));

  const roofLights: { mesh: THREE.Mesh; phase: number }[] = [];
  [-1.3, -0.8, -0.3, 0.2, 0.7, 1.2].forEach((rx, i) => {
    const rl = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), roofLightMat.clone());
    rl.position.set(rx + 0.4, 2.12, 0.05);
    add(rl);
    roofLights.push({ mesh: rl, phase: i * 0.2 });
  });

  const flagTex = makeFlagTexture();
  add(planeWith(flagTex, -1.4, 1.0, 0.06, 0.22, 0.14, 0.5));
  add(cy(0.015, 0.3, darkMetal, -1.4, 0.83, 0.06, 8));

  createAircraft(-0.4, 0.7, -0.85, 'primer', 0.95);

  const workLights: THREE.Mesh[] = [];
  const workLightPositions: [number, number, number][] = [
    [-1.0, 1.6, -1.0], [0.2, 1.6, -1.0],
    [-1.0, 1.6, -0.3], [0.2, 1.6, -0.3],
  ];
  workLightPositions.forEach(([lx, ly, lz]) => {
    const wl = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), workLightMat);
    wl.position.set(lx, ly, lz);
    add(wl);
    workLights.push(wl);
    const pl = new THREE.PointLight(0xfff8c0, 0.55, 1.5);
    pl.position.set(lx, ly, lz);
    add(pl);
  });

  cbx(2.0, 0.04, 0.06, darkMetal, -0.4, 1.55, -0.8);
  add(cy(0.005, 1.0, darkMetal, -0.4, 0.55, -0.85, 6));

  cbx(0.1, 0.12, 0.12, boeingBlueLight, -1.4, 0.2, -0.4);
  cbx(0.1, 0.12, 0.12, boeingBlueLight, -1.4, 0.2, -0.6);
  cbx(0.1, 0.12, 0.12, boeingBlueLight, 0.8, 0.2, -0.4);
  cbx(0.04, 0.5, 0.04, darkMetal, -0.4, 0.4, -0.3);

  // ── Wing conveyor ──
  const conveyorY = 0.16;
  const conveyorZ = 0.6;
  cbx(3.0, 0.06, 0.5, conveyorBase, -0.4, conveyorY, conveyorZ);
  cbx(3.0, 0.02, 0.46, conveyorBelt, -0.4, conveyorY + 0.035, conveyorZ);

  const rollerL = cy(0.05, 0.5, metal, -1.92, conveyorY + 0.02 - 0.25, conveyorZ, 12);
  rollerL.rotation.x = Math.PI / 2;
  add(rollerL);
  const rollerR = cy(0.05, 0.5, metal, 1.12, conveyorY + 0.02 - 0.25, conveyorZ, 12);
  rollerR.rotation.x = Math.PI / 2;
  add(rollerR);

  for (let i = 0; i < 3; i++) {
    const lx = -1.7 + i * 1.3;
    cbx(0.04, 0.08, 0.04, metal, lx, conveyorY - 0.04, conveyorZ + 0.18);
    cbx(0.04, 0.08, 0.04, metal, lx, conveyorY - 0.04, conveyorZ - 0.18);
  }

  const conveyorWings: { group: THREE.Group; offset: number }[] = [];
  [0, 0.5].forEach(offset => {
    const wing = createSeparateWing(-1.6, conveyorY + 0.07, conveyorZ, 0.55);
    conveyorWings.push({ group: wing, offset });
  });

  // ── Runway ──
  cbx(gx(3.7), 0.04, gx(0.7), runwayAsphalt, 0.4, 0.105, 1.5);
  for (let i = 0; i < 10; i++) {
    cbx(0.18, 0.005, 0.04, runwayLine, -1.3 + i * 0.4, 0.135, 1.5);
  }
  cbx(0.04, 0.005, 0.6, runwayLine, -1.4, 0.135, 1.5);
  cbx(0.04, 0.005, 0.6, runwayLine, 2.1, 0.135, 1.5);

  const runwayLights: { mesh: THREE.Mesh; phase: number }[] = [];
  const lightCount = 14;
  for (let i = 0; i < lightCount; i++) {
    const lx = -1.4 + (i / (lightCount - 1)) * 3.5;
    const lightT = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), runwayLight.clone());
    lightT.position.set(lx, 0.14, 1.18);
    add(lightT);
    runwayLights.push({ mesh: lightT, phase: i * 0.15 });
    const lightB = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), runwayLight.clone());
    lightB.position.set(lx, 0.14, 1.82);
    add(lightB);
    runwayLights.push({ mesh: lightB, phase: i * 0.15 + 0.07 });
  }

  const completeAircraft = createAircraft(1.4, 0.4, 1.5, 'complete', 0.7);

  // ── Control tower ──
  cbx(0.3, 0.7, 0.3, whiteAccent, 2.0, 0.5, -1.2);
  add(cy(0.06, 0.9, whiteAccent, 2.0, 0.75, -1.2, 12));
  cbx(0.35, 0.22, 0.35, glass, 2.0, 1.75, -1.2);
  cbx(0.38, 0.04, 0.38, darkMetal, 2.0, 1.88, -1.2);

  const towerLightPivot = new THREE.Group();
  towerLightPivot.position.set(2.0, 1.93, -1.2);
  add(towerLightPivot);
  const towerLight = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 12, 1, true), towerLightMat);
  towerLight.rotation.x = -Math.PI / 2;
  towerLight.position.set(0.15, 0, 0);
  towerLightPivot.add(towerLight);
  const towerPointLight = new THREE.PointLight(0xff6600, 0.6, 2.5);
  towerPointLight.position.set(0, 0, 0);
  towerLightPivot.add(towerPointLight);

  // ── Defense hangar ──
  cbx(0.7, 1.5, 1.3, defenseGray, -1.9, 0.75, -0.5);
  cbx(0.75, 0.1, 1.35, defenseDark, -1.9, 1.52, -0.5);
  cbx(0.78, 0.04, 1.38, defenseAccent, -1.9, 1.58, -0.5);
  cbx(0.5, 1.2, 0.1, hangarVoid, -1.9, 0.7, 0.16);

  const defenseTex = makeBoeingDefenseLogoTexture();
  const defenseSign = planeWith(defenseTex, -2.26, 0.85, -0.5, 0.6, 0.18, 0.4);
  defenseSign.rotation.y = Math.PI / 2;
  add(defenseSign);
  const defenseRoofSign = planeWith(defenseTex, -1.9, 1.78, 0.1, 0.6, 0.18, 0.4);
  defenseRoofSign.rotation.x = -Math.PI / 10;
  add(defenseRoofSign);

  createFighterJet(-1.9, 0.5, -0.55, 0.85);

  add(planeWith(makeFlagTexture(), -1.55, 1.0, 0.16, 0.18, 0.12, 0.5));
  add(cy(0.013, 0.25, darkMetal, -1.55, 0.705, 0.16, 8));

  const defenseLights: THREE.Mesh[] = [];
  [[-1.7, 1.3, -0.5], [-2.05, 1.3, -0.5]].forEach(([lx, ly, lz]) => {
    const dl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), defenseLightMat.clone());
    dl.position.set(lx, ly, lz);
    add(dl);
    defenseLights.push(dl);
    const pl = new THREE.PointLight(0x5fa3ff, 0.5, 1.2);
    pl.position.set(lx, ly, lz);
    add(pl);
  });

  cbx(0.06, 0.3, 0.04, darkMetal, -1.55, 0.2, 0.45);
  cbx(0.06, 0.06, 0.04, securityRed, -1.55, 0.37, 0.45);

  // ── Boeing HQ ──
  cbx(0.8, 1.2, 0.6, whiteAccent, -1.7, 0.6, -1.8);
  cbx(0.85, 0.06, 0.65, boeingBlue, -1.7, 1.22, -1.8);

  const hqWindows: { mesh: THREE.Mesh; row: number; col: number }[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const wx = -1.9 + col * 0.13;
      const wy = 0.3 + row * 0.22;
      hqWindows.push({
        mesh: cbx(0.1, 0.16, 0.025, warmWindow.clone(), wx, wy, -1.5),
        row,
        col,
      });
    }
  }

  add(planeWith(makeBoeingLogoTexture(), -1.7, 1.05, -1.49, 0.6, 0.16, 0.25));

  // ── Revenue board ──
  cbx(0.5, 0.5, 0.08, darkMetal, 0.5, 0.4, 1.95);
  add(planeWith(makeRevenueBoardTexture(), 0.5, 0.4, 2.0, 0.45, 0.45, 0.4));
  cbx(0.03, 0.25, 0.03, darkMetal, 0.5, 0.18, 1.95);

  // ── Apron / roads ──
  cbx(gx(3.5), 0.04, gx(0.3), grayMid, 0.4, 0.105, 1.0);
  for (let i = 0; i < 6; i++) {
    cbx(0.1, 0.005, 0.03, runwayLine, -1.0 + i * 0.6, 0.135, 0.95);
  }

  // ── Vehicles ──
  cbx(0.18, 0.09, 0.1, boeingBlue, 0.4, 0.18, 1.0);
  cbx(0.1, 0.06, 0.09, glassDark, 0.42, 0.25, 1.0);
  cbx(0.22, 0.18, 0.22, militaryBody, -1.2, 0.2, 1.0);
  cbx(0.38, 0.22, 0.26, militaryBody, -0.95, 0.22, 1.0);

  // ── Company sign ──
  cbx(0.6, 0.32, 0.06, boeingBlue, -1.0, 0.42, 1.7);
  add(planeWith(makeSimpleSign('BOEING', '#0033a0', '#ffffff'), -1.0, 0.45, 1.735, 0.55, 0.25, 0.5));

  // ── People ──
  const peopleColors = [0xfffae0, 0xffaa00, 0xfffae0, 0x0033a0, 0x2a3a25];
  for (let i = 0; i < 12; i++) {
    const px = -1.5 + (i % 6) * 0.45;
    const pz = 0.2 + Math.floor(i / 6) * 0.15;
    const person = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.09, 0.035),
      mat(peopleColors[i % peopleColors.length]!, 0.7),
    );
    person.position.set(px, 0.175, pz);
    person.castShadow = true;
    add(person);
  }

  // ── Trees ──
  createTree(-2.1, 1.95, 0.42);
  createTree(2.05, 1.95, 0.42);
  createTree(2.05, -1.85, 0.42);

  // ── Lights ──
  const hangarLight = new THREE.PointLight(0xfff8c0, 1.0, 3.5);
  hangarLight.position.set(-0.4, 1.2, -0.8);
  add(hangarLight);
  const hqGlow = new THREE.PointLight(0xfff2c8, 0.5, 2.5);
  hqGlow.position.set(-1.7, 0.6, -1.6);
  add(hqGlow);
  const runwayRim = new THREE.PointLight(0x3a78d0, 0.4, 4);
  runwayRim.position.set(0.4, 0.3, 1.5);
  add(runwayRim);
  const defenseGlow = new THREE.PointLight(0x5fa3ff, 0.5, 2);
  defenseGlow.position.set(-1.9, 0.8, 0);
  add(defenseGlow);

  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;

    hqWindows.forEach(fw => {
      const wave = 0.4 + 0.6 * Math.max(0, Math.sin(t * 1.2 - fw.row * 0.3 + fw.col * 0.1));
      (fw.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = wave;
    });

    workLights.forEach((wl, i) => {
      (wl.material as THREE.MeshBasicMaterial).color.setRGB(
        1,
        0.97 + 0.03 * Math.sin(t * 3 + i),
        0.75 + 0.05 * Math.sin(t * 4 + i),
      );
    });

    runwayLights.forEach(rl => {
      const pulse = 0.5 + 1.5 * Math.abs(Math.sin(t * 2 + rl.phase * 4));
      (rl.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    });

    towerLightPivot.rotation.y = tRaw * 1.5;

    const acProgress = (t * 0.06) % 1;
    completeAircraft.position.x = -1.0 + acProgress * 3.0;
    completeAircraft.position.y = 0.4;
    completeAircraft.rotation.z = 0;

    conveyorWings.forEach(w => {
      const progress = ((t * 0.12) + w.offset) % 1;
      w.group.position.x = -1.85 + progress * 2.9;
    });

    defenseLights.forEach((dl, i) => {
      const c = 0.6 + 0.4 * Math.abs(Math.sin(t * 2 + i));
      (dl.material as THREE.MeshBasicMaterial).color.setRGB(0.37 * c, 0.64 * c, 1.0 * c);
    });

    roofLights.forEach(rl => {
      const c = 0.5 + 0.5 * Math.abs(Math.sin(t * 1.8 + rl.phase * 3));
      (rl.mesh.material as THREE.MeshBasicMaterial).color.setRGB(0.37 * c, 0.64 * c, 1.0 * c);
    });

    root.rotation.y = Math.sin(t * 0.25) * 0.012;
  };

  return root;
}

// ── NVIDIA: 1셀 슬림 · CUDA + AI Edition (NVDA) ──
export function createNvidiaFab(): THREE.Group {
  const nvGreen = new THREE.MeshStandardMaterial({
    color: 0x76b900,
    roughness: 0.3,
    metalness: 0.15,
    emissive: 0x76b900,
    emissiveIntensity: 0.4,
  });
  const nvGreenStrong = new THREE.MeshStandardMaterial({
    color: 0x76b900,
    roughness: 0.25,
    emissive: 0x76b900,
    emissiveIntensity: 1.5,
  });
  const nvGreenDim = mat(0x3a5e00, 0.5, 0.1);
  const cyanLed = new THREE.MeshStandardMaterial({
    color: 0x00d4ff,
    roughness: 0.2,
    emissive: 0x00d4ff,
    emissiveIntensity: 2.5,
  });
  const black = mat(0x0a0a0e, 0.35, 0.35);
  const darkGray = mat(0x1a1a20, 0.5, 0.35);
  const midGray = mat(0x2a2a32, 0.55, 0.35);
  const grayLight = mat(0x5a5a62, 0.65, 0.25);
  const darkMetal = mat(0x444444, 0.3, 0.8);
  const glass = new THREE.MeshStandardMaterial({
    color: 0x7eb5e0,
    roughness: 0.1,
    metalness: 0.15,
    transparent: true,
    opacity: 0.55,
    emissive: 0x3a78a0,
    emissiveIntensity: 0.2,
  });
  const glassDark = mat(0x0a141e, 0.2, 0.5);
  const warmWindow = new THREE.MeshStandardMaterial({
    color: 0xfff2c8,
    roughness: 0.35,
    emissive: 0xffb93d,
    emissiveIntensity: 0.65,
  });
  const basePlinth = mat(0x020608, 0.55);
  const platform = mat(0x1a1e22, 0.8);
  const road = mat(0x0e1216, 0.85);
  const grass = mat(0x3a6a3a, 0.9);
  const gpuBody = mat(0x15151a, 0.3, 0.55);
  const gpuPcb = mat(0x143020, 0.55, 0.2);
  const serverRack = mat(0x0a0a10, 0.35, 0.65);
  const roadLineGreen = new THREE.MeshStandardMaterial({
    color: 0x76b900,
    roughness: 0.6,
    emissive: 0x76b900,
    emissiveIntensity: 0.5,
  });
  const skyBeamMat = new THREE.MeshBasicMaterial({ color: 0x76b900, transparent: true, opacity: 0.35 });
  const fanMat = mat(0x1a1a1a, 0.8);
  const bladeMat = mat(0x3a3a3a, 0.7);
  const wheelMat = mat(0x1a1a1a, 0.8);
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff8c0 });
  const beadMat = new THREE.MeshStandardMaterial({
    color: 0x9be820,
    roughness: 0.2,
    emissive: 0x9be820,
    emissiveIntensity: 2.5,
  });
  const monitorMat = new THREE.MeshStandardMaterial({
    color: 0x00d4ff,
    roughness: 0.4,
    emissive: 0x00d4ff,
    emissiveIntensity: 0.6,
  });

  const matEm = (color: number, emissive: number, emissiveIntensity: number, roughness = 0.35, metalness = 0.3) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });

  const root = new THREE.Group();
  const add = (o: THREE.Object3D) => {
    root.add(o);
    return o;
  };
  const cbx = (sx: number, sy: number, sz: number, m: THREE.Material, x: number, y: number, z: number) =>
    add(bx(sx, sy, sz, m, x, y - sy / 2, z)) as THREE.Mesh;
  const boxC = cbx;
  const cylC = (r: number, h: number, m: THREE.Material, x: number, y: number, z: number, segs = 24) =>
    add(cy(r, h, m, x, y - h / 2, z, segs)) as THREE.Mesh;

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const makeNvidiaLogoTexture = (bgColor = '#0a0a0e') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#76b900';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    const cx = 170;
    const cy = canvas.height / 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 25, 60, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - 25, 60, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.fillStyle = '#76b900';
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 130px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('NVIDIA', 270, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeCudaLayerTexture = (text: string, bgColor = '#0a0a0e') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#76b900';
    ctx.font = 'bold 56px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makePartnersBoardTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a0a0e';
    roundRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 24);
    ctx.fill();
    ctx.strokeStyle = '#76b900';
    ctx.lineWidth = 5;
    roundRect(ctx, 12, 12, canvas.width - 24, canvas.height - 24, 24);
    ctx.stroke();
    ctx.fillStyle = '#76b900';
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MANUFACTURING PARTNERS', canvas.width / 2, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ['TSMC', 'SAMSUNG', 'FOXCONN'].forEach((name, i) => {
      ctx.fillText(name, 180 + i * 320, 220);
    });
    ctx.fillStyle = '#9a9a9e';
    ctx.font = 'bold 34px Arial';
    ctx.fillText('NVIDIA designs · Partners manufacture', canvas.width / 2, 330);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeFablessSignTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a0a0e';
    roundRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, 18);
    ctx.fill();
    ctx.strokeStyle = '#ff3344';
    ctx.lineWidth = 4;
    roundRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, 18);
    ctx.stroke();
    ctx.strokeStyle = '#ff3344';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(70, 128, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(45, 103);
    ctx.lineTo(95, 153);
    ctx.moveTo(95, 103);
    ctx.lineTo(45, 153);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('NVIDIA DOES NOT', 130, 100);
    ctx.fillText('MANUFACTURE', 130, 130);
    ctx.fillStyle = '#9a9a9e';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('We design chips.', 130, 165);
    ctx.fillText('Our partners manufacture.', 130, 188);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeLabelTexture = (text: string, bg = '#0a0a0e', color = '#76b900') => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bg;
    roundRect(ctx, 6, 6, canvas.width - 12, canvas.height - 12, 14);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    roundRect(ctx, 6, 6, canvas.width - 12, canvas.height - 12, 14);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 56px Arial';
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

  type GpuUnit = { group: THREE.Group; fans: THREE.Group[]; rgbStrip: THREE.Mesh };
  const createGPU = (x: number, y: number, z: number, scale = 1): GpuUnit => {
    const gpuGroup = new THREE.Group();
    gpuGroup.position.set(x, y, z);
    gpuGroup.scale.setScalar(scale);
    add(gpuGroup);

    const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.18), gpuPcb);
    pcb.castShadow = true;
    gpuGroup.add(pcb);

    const shroud = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.16), gpuBody);
    shroud.position.set(0, 0.04, 0);
    shroud.castShadow = true;
    gpuGroup.add(shroud);

    const fans: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const fanPivot = new THREE.Group();
      fanPivot.position.set(-0.15 + i * 0.15, 0.085, 0);
      gpuGroup.add(fanPivot);
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.005, 16), fanMat);
      fanPivot.add(fan);
      for (let b = 0; b < 4; b++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.003, 0.012), bladeMat);
        blade.position.set(0, 0.003, 0);
        blade.rotation.y = (b / 4) * Math.PI * 2;
        blade.position.x = 0.025 * Math.cos((b / 4) * Math.PI * 2);
        blade.position.z = 0.025 * Math.sin((b / 4) * Math.PI * 2);
        fanPivot.add(blade);
      }
      fans.push(fanPivot);
    }

    const rgbStrip = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.012, 0.005), nvGreenStrong);
    rgbStrip.position.set(0, 0.07, 0.082);
    gpuGroup.add(rgbStrip);

    return { group: gpuGroup, fans, rgbStrip };
  };

  type RackUnit = { group: THREE.Group; leds: { mesh: THREE.Mesh; phase: number }[] };
  const createServerRack = (x: number, y: number, z: number, scale = 1): RackUnit => {
    const rack = new THREE.Group();
    rack.position.set(x, y, z);
    rack.scale.setScalar(scale);
    add(rack);

    const rackBox = (sx: number, sy: number, sz: number, m: THREE.Material, px: number, py: number, pz: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
      mesh.position.set(px, py, pz);
      mesh.castShadow = mesh.receiveShadow = true;
      rack.add(mesh);
      return mesh;
    };

    rackBox(0.32, 0.8, 0.28, serverRack, 0, 0, 0);
    rackBox(0.28, 0.75, 0.005, glassDark, 0, 0, 0.141);

    const leds: { mesh: THREE.Mesh; phase: number }[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 3; col++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.025, 0.005), cyanLed.clone());
        led.position.set(-0.08 + col * 0.08, 0.32 - row * 0.085, 0.145);
        rack.add(led);
        leds.push({ mesh: led, phase: (row * 3 + col) * 0.12 });
      }
    }

    const topLabel = planeWith(makeLabelTexture('DGX', '#0a0a0e', '#76b900'), 0, 0.41, 0, 0.2, 0.05, 0.5);
    topLabel.rotation.x = -Math.PI / 2;
    rack.add(topLabel);

    return { group: rack, leds };
  };

  type CudaUnit = {
    group: THREE.Group;
    layerMeshes: { cube: THREE.Mesh; edges: THREE.LineSegments; phase: number }[];
    core: THREE.Mesh;
    baseRing: THREE.Mesh;
  };

  const createCudaCube = (x: number, y: number, z: number): CudaUnit => {
    const cudaGroup = new THREE.Group();
    cudaGroup.position.set(x, y, z);
    add(cudaGroup);

    const layers = [
      { name: 'NVIDIA GPU', y: 0.0, size: 0.85, color: 0x0a0a0e },
      { name: 'CUDA', y: 0.16, size: 0.75, color: 0x143020 },
      { name: 'CUDA-X LIBRARIES', y: 0.32, size: 0.65, color: 0x1a3a20 },
      { name: 'APPS & FRAMEWORKS', y: 0.48, size: 0.55, color: 0x1f4625 },
      { name: 'CUDA ECOSYSTEM', y: 0.64, size: 0.45, color: 0x245a2a },
    ];

    const layerMeshes: CudaUnit['layerMeshes'] = [];
    layers.forEach((layer, i) => {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(layer.size, 0.14, layer.size),
        matEm(layer.color, 0x76b900, 0.1),
      );
      cube.position.set(0, layer.y, 0);
      cube.castShadow = true;
      cudaGroup.add(cube);

      const edgeGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(layer.size * 1.01, 0.142, layer.size * 1.01));
      const edges = new THREE.LineSegments(edgeGeom, new THREE.LineBasicMaterial({ color: 0x76b900 }));
      edges.position.set(0, layer.y, 0);
      cudaGroup.add(edges);

      const label = planeWith(makeCudaLayerTexture(layer.name), 0, layer.y, layer.size / 2 + 0.005, layer.size * 0.95, 0.1, 0.6);
      cudaGroup.add(label);

      layerMeshes.push({ cube, edges, phase: i * 0.4 });
    });

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x9be820 }),
    );
    core.position.set(0, 0.78, 0);
    cudaGroup.add(core);

    const baseRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.02, 32),
      matEm(0x0a0a0e, 0x76b900, 1.5),
    );
    baseRing.position.set(0, -0.085, 0);
    cudaGroup.add(baseRing);

    return { group: cudaGroup, layerMeshes, core, baseRing };
  };

  const createTree = (x: number, z: number, s = 0.5) => {
    cylC(0.035, 0.38 * (s / 0.5), mat(0x5a3a20, 0.8), x, 0.23 * (s / 0.5), z, 10);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.18 * (s / 0.5), 18, 12), grass);
    crown.position.set(x, 0.52 * (s / 0.5), z);
    crown.castShadow = crown.receiveShadow = true;
    add(crown);
  };

  // ── Base ──
  cbx(gx(4.8), 0.26, gx(4.3), basePlinth, 0, -0.13, 0);
  cbx(gx(4.35), 0.12, gx(3.85), platform, 0, 0.02, 0);
  cbx(gx(4.0), 0.04, gx(0.55), road, 0, 0.105, 1.5);
  cbx(gx(0.4), 0.04, gx(1.8), road, -1.5, 0.11, -1.2);
  cbx(gx(0.4), 0.04, gx(1.8), road, 1.5, 0.11, -1.2);
  for (let i = 0; i < 8; i++) {
    cbx(0.2, 0.005, 0.025, roadLineGreen, -1.6 + i * 0.45, 0.135, 1.5);
  }

  // ── HQ ──
  boxC(1.9, 2.0, 1.4, black, 0.0, 1.0, -0.5);
  boxC(1.95, 0.08, 1.45, nvGreen, 0.0, 2.04, -0.5);

  const floorWindows: { mesh: THREE.Mesh; row: number; col: number }[] = [];
  const winCols = 7;
  const winRows = 5;
  const winW = 0.2;
  const winH = 0.28;
  const winGapX = 0.04;
  const winGapY = 0.06;
  const totalW = winCols * winW + (winCols - 1) * winGapX;
  const totalH = winRows * winH + (winRows - 1) * winGapY;
  const startX = -totalW / 2 + winW / 2;
  const startY = 1.0 - totalH / 2 + winH / 2;
  for (let row = 0; row < winRows; row++) {
    for (let col = 0; col < winCols; col++) {
      const wx = startX + col * (winW + winGapX);
      const wy = startY + row * (winH + winGapY);
      const w = boxC(winW, winH, 0.02, warmWindow.clone(), wx, wy, 0.215);
      floorWindows.push({ mesh: w, row, col });
    }
  }

  boxC(0.03, 2.0, 1.3, glass, -0.96, 1.0, -0.5);
  boxC(0.03, 2.0, 1.3, glass, 0.96, 1.0, -0.5);
  boxC(1.5, 0.3, 0.04, glassDark, 0.0, 0.2, 0.22);
  boxC(1.6, 0.04, 0.2, nvGreen, 0.0, 0.4, 0.32);
  add(planeWith(makeNvidiaLogoTexture('#0a0a0e'), 0.0, 0.6, 0.245, 0.8, 0.16, 0.5));

  const nvSignTex = makeNvidiaLogoTexture('#0a0a0e');
  const nvSign = add(planeWith(nvSignTex, 0.0, 2.6, 0.05, 1.8, 0.4, 0.7));
  nvSign.rotation.x = -Math.PI / 9;
  boxC(0.05, 0.4, 0.05, darkMetal, -0.55, 2.3, 0.0);
  boxC(0.05, 0.4, 0.05, darkMetal, 0.55, 2.3, 0.0);
  add(planeWith(nvSignTex, 0.0, 2.18, -0.5, 0.7, 0.16, 0.5));

  [[-0.6, -0.5], [0.6, -0.5], [-0.6, -1.0], [0.6, -1.0]].forEach(([hx, hz]) => {
    boxC(0.18, 0.1, 0.18, midGray, hx, 2.13, hz);
  });

  const cuda = createCudaCube(0.0, 0.18, 0.85);

  boxC(0.8, 0.02, 0.55, darkGray, -1.55, 0.13, 0.7);
  const gpus: GpuUnit[] = [];
  gpus.push(createGPU(-1.55, 0.18, 0.55, 0.95));
  gpus.push(createGPU(-1.55, 0.28, 0.7, 0.95));
  gpus.push(createGPU(-1.55, 0.38, 0.85, 0.95));
  add(planeWith(makeLabelTexture('GeForce RTX', '#0a0a0e', '#76b900'), -1.55, 0.55, 0.99, 0.5, 0.1, 0.5));
  boxC(0.55, 0.12, 0.02, darkGray, -1.55, 0.55, 0.985);

  const dgxRacks: RackUnit[] = [];
  dgxRacks.push(createServerRack(1.3, 0.55, 0.7, 1.0));
  dgxRacks.push(createServerRack(1.55, 0.55, 0.7, 1.0));
  dgxRacks.push(createServerRack(1.8, 0.55, 0.7, 1.0));
  add(planeWith(makeLabelTexture('DGX AI', '#0a0a0e', '#00d4ff'), 1.55, 1.05, 0.84, 0.5, 0.1, 0.5));

  const aiInfraRacks: RackUnit[] = [];
  for (let i = 0; i < 4; i++) {
    aiInfraRacks.push(createServerRack(1.6 + (i % 2) * 0.3, 0.55, -1.0 - Math.floor(i / 2) * 0.4, 0.85));
  }
  add(planeWith(makeLabelTexture('AI INFRASTRUCTURE', '#0a0a0e', '#00d4ff'), 1.75, 1.1, -1.55, 0.55, 0.1, 0.5));

  boxC(0.75, 1.0, 0.7, darkGray, -1.65, 0.5, -1.2);
  boxC(0.8, 0.05, 0.75, nvGreen, -1.65, 1.02, -1.2);
  boxC(0.65, 0.6, 0.025, glass, -1.65, 0.55, -0.85);
  for (let i = 0; i < 4; i++) {
    const mx = -1.85 + (i % 2) * 0.4;
    const my = 0.4 + Math.floor(i / 2) * 0.3;
    boxC(0.15, 0.1, 0.005, monitorMat, mx, my, -0.836);
  }
  add(planeWith(makeLabelTexture('DESIGN & INNOVATION', '#0a0a0e', '#76b900'), -1.65, 1.13, -1.2, 0.7, 0.1, 0.5));

  boxC(1.2, 0.5, 0.06, darkGray, 0.0, 0.5, 1.85);
  add(planeWith(makePartnersBoardTexture(), 0.0, 0.5, 1.885, 1.15, 0.45, 0.5));
  boxC(0.04, 0.3, 0.04, darkMetal, -0.5, 0.2, 1.85);
  boxC(0.04, 0.3, 0.04, darkMetal, 0.5, 0.2, 1.85);

  boxC(0.4, 0.32, 0.04, darkGray, -0.95, 0.42, 1.4);
  add(planeWith(makeFablessSignTexture(), -0.95, 0.42, 1.425, 0.36, 0.28, 0.4));
  cylC(0.02, 0.18, darkMetal, -0.95, 0.2, 1.4, 8);

  boxC(0.05, 0.65, 0.4, darkGray, 2.2, 0.7, -0.3);
  const blackwellTex = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a0a0e';
    roundRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, 18);
    ctx.fill();
    ctx.strokeStyle = '#76b900';
    ctx.lineWidth = 4;
    roundRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, 18);
    ctx.stroke();
    ctx.fillStyle = '#9a9a9e';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NVIDIA GPU ARCHITECTURE', canvas.width / 2, 50);
    ctx.fillStyle = '#76b900';
    ctx.font = 'bold 50px Arial';
    ctx.fillText('BLACKWELL', canvas.width / 2, 130);
    ctx.fillText('ARCHITECTURE', canvas.width / 2, 185);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('> Higher Performance', 50, 250);
    ctx.fillText('> Lower Power', 50, 295);
    ctx.fillText('> AI-Optimized', 50, 340);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const blackwellPlane = add(planeWith(blackwellTex, 2.175, 0.7, -0.3, 0.45, 0.55, 0.4));
  blackwellPlane.rotation.y = -Math.PI / 2;

  const truckGroup = new THREE.Group();
  truckGroup.position.set(-0.5, 0.2, 1.55);
  add(truckGroup);
  const truckBox = (sx: number, sy: number, sz: number, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    truckGroup.add(mesh);
    return mesh;
  };
  truckBox(0.18, 0.16, 0.18, nvGreen, 0, 0, 0);
  truckBox(0.32, 0.2, 0.2, darkGray, 0.22, 0.02, 0);
  truckGroup.add(planeWith(makeNvidiaLogoTexture('#0a0a0e'), 0.22, 0.05, 0.101, 0.3, 0.1, 0.4));
  for (let i = 0; i < 4; i++) {
    const wx = -0.05 + (i % 2) * 0.32;
    const wz = -0.07 + Math.floor(i / 2) * 0.14;
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12), wheelMat);
    wheel.position.set(wx, -0.085, wz);
    wheel.rotation.x = Math.PI / 2;
    wheel.castShadow = true;
    truckGroup.add(wheel);
  }
  [[-0.06, 0.07], [-0.06, -0.07]].forEach(([hx, hz]) => {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), headlightMat);
    hl.position.set(-0.09, -0.02, hz);
    truckGroup.add(hl);
  });

  const skyBeam = add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.13, 3.5, 12, 1, true), skyBeamMat),
  ) as THREE.Mesh;
  skyBeam.position.set(0.0, 4.4, 0.05);
  skyBeam.castShadow = false;

  const dataPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.8, 0.85),
    new THREE.Vector3(0.0, 1.5, 0.4),
    new THREE.Vector3(0.0, 1.2, -0.45),
  ]);
  const dataBeads: { mesh: THREE.Mesh; offset: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), beadMat);
    b.castShadow = false;
    add(b);
    dataBeads.push({ mesh: b, offset: i / 6 });
  }

  const peopleColors = [0x76b900, 0xffffff, 0x3a3a3a, 0x0a0a0e, 0x76b900];
  for (let i = 0; i < 8; i++) {
    const px = -0.9 + (i % 4) * 0.3;
    const pz = 0.4 + Math.floor(i / 4) * 0.12;
    const person = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.1, 0.04),
      mat(peopleColors[i % peopleColors.length]!, 0.7),
    );
    person.position.set(px, 0.18, pz);
    person.castShadow = true;
    add(person);
  }

  createTree(-2.1, 1.85, 0.42);
  createTree(2.1, 1.85, 0.42);
  createTree(-2.1, -1.85, 0.42);
  createTree(2.1, -1.85, 0.42);

  add(new THREE.PointLight(0xfff2c8, 0.5, 3)).position.set(0.0, 1.0, -0.3);
  const cudaGlow = add(new THREE.PointLight(0x76b900, 1.5, 3)) as THREE.PointLight;
  cudaGlow.position.set(0.0, 0.5, 0.85);
  add(new THREE.PointLight(0x00d4ff, 0.7, 2.5)).position.set(1.55, 0.7, 0.7);
  add(new THREE.PointLight(0x00d4ff, 0.6, 3)).position.set(1.7, 0.7, -1.2);
  add(new THREE.PointLight(0x76b900, 0.6, 2)).position.set(-1.55, 0.4, 0.7);
  add(new THREE.PointLight(0x76b900, 0.5, 2)).position.set(-1.65, 0.6, -1.0);

  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;

    floorWindows.forEach(fw => {
      const wave = 0.4 + 0.6 * Math.max(0, Math.sin(t * 1.2 - fw.row * 0.3 + fw.col * 0.1));
      (fw.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = wave;
    });

    cuda.layerMeshes.forEach(layer => {
      const pulse = 0.1 + 0.4 * Math.max(0, Math.sin(t * 1.2 + layer.phase));
      (layer.cube.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    });
    (cuda.core.material as THREE.MeshBasicMaterial).color.setRGB(
      0.46 + 0.4 * Math.sin(t * 3),
      0.92,
      0.0,
    );
    (cuda.baseRing.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0 + 1.0 * Math.sin(t * 2);
    cudaGlow.intensity = 1.2 + 0.5 * Math.sin(t * 2);

    gpus.forEach((gpu, gi) => {
      gpu.fans.forEach(fan => {
        fan.rotation.y = tRaw * 8;
      });
      const r = 0.46 + 0.3 * Math.sin(t * 2 + gi);
      const g_ = 0.72;
      const b = 0.0 + 0.3 * Math.abs(Math.sin(t * 1.5 + gi));
      (gpu.rgbStrip.material as THREE.MeshStandardMaterial).color.setRGB(r, g_, b);
      (gpu.rgbStrip.material as THREE.MeshStandardMaterial).emissive.setRGB(r, g_, b);
    });

    dgxRacks.forEach(rack => {
      rack.leds.forEach(led => {
        (led.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          1.5 + 1.5 * Math.abs(Math.sin(t * 4 + led.phase * 3));
      });
    });

    aiInfraRacks.forEach(rack => {
      rack.leds.forEach(led => {
        (led.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          1.0 + 1.5 * Math.abs(Math.sin(t * 3.5 + led.phase * 2.5));
      });
    });

    skyBeamMat.opacity = 0.3 + 0.15 * Math.sin(t * 1.5);
    skyBeam.scale.x = skyBeam.scale.z = 1 + 0.13 * Math.sin(t * 2);

    (nvSign.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + 0.3 * Math.sin(t * 1.5);

    dataBeads.forEach((b, i) => {
      const progress = ((t * 0.4) + b.offset) % 1;
      b.mesh.position.copy(dataPath.getPoint(progress));
      (b.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.5 + 1.0 * Math.sin(t * 6 + i);
    });

    const truckProgress = (t * 0.1 + 0.3) % 1.2;
    if (truckProgress < 1.0) {
      truckGroup.position.x = -1.8 + truckProgress * 3.3;
      truckGroup.visible = true;
    } else {
      truckGroup.visible = false;
    }

    root.rotation.y = Math.sin(t * 0.25) * 0.012;
  };

  return root;
}

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

// ── Samsung Electronics: 1셀 슬림 v3 Product Showcase Edition (005930) ─────────
export function createSamsungFab(): THREE.Group {
  const blue = mat(0x1428a0, 0.6, 0.1);
  const blueLight = new THREE.MeshStandardMaterial({
    color: 0x4d8dff,
    roughness: 0.3,
    metalness: 0.15,
    emissive: 0x1b5dff,
    emissiveIntensity: 0.25,
  });
  const white = mat(0xf4f4f4, 0.85, 0);
  const silver = mat(0xcfd4dc, 0.42, 0.35);
  const metalGrey = mat(0x999999, 0.4, 0.65);
  const glass = new THREE.MeshStandardMaterial({
    color: 0x78b7ff,
    roughness: 0.1,
    metalness: 0.08,
    transparent: true,
    opacity: 0.42,
    emissive: 0x0a3cff,
    emissiveIntensity: 0.12,
  });
  const warmWindow = new THREE.MeshStandardMaterial({
    color: 0xfff2c8,
    roughness: 0.35,
    emissive: 0xffb93d,
    emissiveIntensity: 0.65,
  });
  const road = mat(0x242832, 0.82);
  const basePlinth = mat(0x111827, 0.55);
  const platform = mat(0xd7dce6, 0.78);
  const green = mat(0x2f7d42, 0.8);
  const conveyorBase = mat(0x3a3a45, 0.6, 0.4);
  const conveyorBelt = mat(0x1a1a22, 0.9, 0.1);
  const phoneBody = mat(0x0a0a0e, 0.35, 0.6);
  const phoneScreenMat = new THREE.MeshStandardMaterial({
    color: 0x3aa0ff,
    roughness: 0.15,
    emissive: 0x3aa0ff,
    emissiveIntensity: 1.2,
  });
  const dramPCB = mat(0x1a5c2f, 0.6, 0.15);
  const dramChip = mat(0x1a1a1a, 0.4, 0.5);
  const dramGold = mat(0xd4af6a, 0.25, 0.85);
  const tvFrame = mat(0x1a1a1a, 0.3, 0.6);
  const tvScreenMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.12,
    emissive: 0x3a78ff,
    emissiveIntensity: 0.9,
  });
  const ssdBody = mat(0x181820, 0.35, 0.6);
  const waferDiscMat = new THREE.MeshStandardMaterial({
    color: 0x9ad5ff,
    roughness: 0.15,
    metalness: 0.4,
    emissive: 0x1e4dcc,
    emissiveIntensity: 0.3,
  });
  const circuitTrace = new THREE.MeshStandardMaterial({
    color: 0x5fb8ff,
    emissive: 0x5fb8ff,
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });
  const scanLineMat = new THREE.MeshBasicMaterial({ color: 0x5fb8ff, transparent: true, opacity: 0.7 });
  const skyBeamMat = new THREE.MeshBasicMaterial({ color: 0x3aa0ff, transparent: true, opacity: 0.35 });
  const beadMat = new THREE.MeshStandardMaterial({
    color: 0x9be3ff,
    emissive: 0x9be3ff,
    emissiveIntensity: 2.0,
    roughness: 0.25,
  });
  const packageBox = mat(0x8a6440, 0.8);

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

  const makeSamsungLogoTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1428a0';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2, 380, 88, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 96px "Arial Black", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SAMSUNG', canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeFabProductTexture = (fabType: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, 24);
    ctx.fill();
    ctx.strokeStyle = '#1428a0';
    ctx.lineWidth = 6;
    roundRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, 24);
    ctx.stroke();
    ctx.fillStyle = '#1428a0';
    ctx.fillRect(8, 8, canvas.width - 16, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fabType, canvas.width / 2, 48);
    const products: Record<string, string[]> = {
      DRAM: ['DDR5 메모리', 'HBM3 (AI)', '서버 메모리'],
      NAND: ['SSD 컨트롤러', 'V-NAND', '플래시 메모리'],
      FOUNDRY: ['7나노 공정', '엑시노스', 'AI 칩 위탁생산'],
    };
    const items = products[fabType] ?? ['제품 라인'];
    ctx.fillStyle = '#1428a0';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'left';
    items.forEach((item, i) => {
      ctx.fillText('• ' + item, 30, 130 + i * 60);
    });
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const fabProductBoard = (fabType: string, x: number, y: number, z: number, w: number, h: number) => {
    const texture = makeFabProductTexture(fabType);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.45,
        emissive: 0xffffff,
        emissiveMap: texture,
        emissiveIntensity: 0.25,
      }),
    );
    mesh.position.set(x, y, z);
    return add(mesh);
  };

  const makeProductLabelTexture = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1428a0';
    roundRect(ctx, 4, 4, canvas.width - 8, canvas.height - 8, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const productLabel = (text: string, x: number, y: number, z: number, w: number, h: number) => {
    const texture = makeProductLabelTexture(text);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.5,
        emissive: 0xffffff,
        emissiveMap: texture,
        emissiveIntensity: 0.3,
      }),
    );
    mesh.position.set(x, y, z);
    return add(mesh);
  };

  const samsungSign = (x: number, y: number, z: number, w: number, h: number) => {
    const texture = makeSamsungLogoTexture();
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.45,
        emissive: 0xffffff,
        emissiveMap: texture,
        emissiveIntensity: 0.2,
      }),
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    return add(mesh);
  };

  const createPhone = (x: number, y: number, z: number, scale = 1) => {
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(x, y, z);
    phoneGroup.scale.setScalar(scale);
    add(phoneGroup);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.018), phoneBody);
    body.castShadow = true;
    phoneGroup.add(body);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.245), phoneScreenMat.clone());
    screen.position.set(0, 0, 0.01);
    phoneGroup.add(screen);
    const camMod = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.005), mat(0x333333, 0.4, 0.7));
    camMod.position.set(-0.04, 0.1, -0.012);
    phoneGroup.add(camMod);
    return { group: phoneGroup, screen };
  };

  const createDRAM = (x: number, y: number, z: number, scale = 1) => {
    const dramGroup = new THREE.Group();
    dramGroup.position.set(x, y, z);
    dramGroup.scale.setScalar(scale);
    add(dramGroup);
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.015), dramPCB);
    pcb.castShadow = true;
    dramGroup.add(pcb);
    for (let i = 0; i < 4; i++) {
      const chipFront = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.012), dramChip);
      chipFront.position.set(-0.13 + i * 0.087, 0.005, 0.011);
      dramGroup.add(chipFront);
      const chipBack = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.012), dramChip);
      chipBack.position.set(-0.13 + i * 0.087, 0.005, -0.011);
      dramGroup.add(chipBack);
    }
    const pins = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.012, 0.012), dramGold);
    pins.position.set(0, -0.038, 0);
    dramGroup.add(pins);
    return dramGroup;
  };

  const createTV = (x: number, y: number, z: number, scale = 1) => {
    const tvGroup = new THREE.Group();
    tvGroup.position.set(x, y, z);
    tvGroup.scale.setScalar(scale);
    add(tvGroup);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.018), tvFrame);
    frame.castShadow = true;
    tvGroup.add(frame);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.17), tvScreenMat.clone());
    screen.position.set(0, 0, 0.01);
    tvGroup.add(screen);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.06), tvFrame);
    stand.position.set(0, -0.12, 0);
    tvGroup.add(stand);
    const tvBase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.08), tvFrame);
    tvBase.position.set(0, -0.146, 0);
    tvGroup.add(tvBase);
    return { group: tvGroup, screen };
  };

  const createSSD = (x: number, y: number, z: number, scale = 1) => {
    const ssdGroup = new THREE.Group();
    ssdGroup.position.set(x, y, z);
    ssdGroup.scale.setScalar(scale);
    add(ssdGroup);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.12), ssdBody);
    body.castShadow = true;
    ssdGroup.add(body);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.4 }),
    );
    label.position.set(0, 0.014, 0);
    label.rotation.x = -Math.PI / 2;
    ssdGroup.add(label);
    return ssdGroup;
  };

  const createWaferDisc = (x: number, y: number, z: number, scale = 1) => {
    const waferGroup = new THREE.Group();
    waferGroup.position.set(x, y, z);
    waferGroup.scale.setScalar(scale);
    add(waferGroup);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.012, 32), waferDiscMat);
    disc.castShadow = true;
    waferGroup.add(disc);
    const dieMat = new THREE.MeshStandardMaterial({
      color: 0x0a2a6a,
      emissive: 0x1e4dcc,
      emissiveIntensity: 0.4,
    });
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const die = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.001, 0.025), dieMat);
        die.position.set(i * 0.04, 0.008, j * 0.04);
        waferGroup.add(die);
      }
    }
    return waferGroup;
  };

  const createTree = (x: number, z: number, s = 0.5) => {
    add(cy(0.035, 0.38 * (s / 0.5), mat(0x7a4b2a, 0.8), x, 0.04 * (s / 0.5), z, 10));
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.18 * (s / 0.5), 18, 12), green);
    crown.position.set(x, 0.52 * (s / 0.5), z);
    crown.castShadow = crown.receiveShadow = true;
    add(crown);
  };

  const hqX = -0.75;
  const hqZ = -0.45;

  cbx(gx(4.8), 0.26, gx(4.3), basePlinth, 0, -0.13, 0);
  cbx(gx(4.35), 0.12, gx(3.85), platform, 0, 0.02, 0);
  cbx(gx(4.0), 0.04, gx(0.62), road, 0, 0.105, 1.36);
  cbx(gx(2.6), 0.04, gx(0.34), road, 0.7, 0.11, hqZ);
  for (const ox of [-1.1, -0.9, -0.7]) cbx(0.08, 0.012, 0.5, white, ox, 0.135, 1.36);

  cbx(2.0, 3.0, 1.5, blue, hqX, 1.5, hqZ);
  cbx(2.1, 0.15, 1.6, white, hqX, 3.08, hqZ);
  cbx(1.65, 0.48, 0.18, white, hqX, 0.32, 0.39);
  cbx(0.95, 0.12, 0.32, blueLight, hqX, 0.72, 0.55);

  const floorWindows: { mesh: THREE.Mesh; floor: number }[] = [];
  for (let floor = 0; floor < 8; floor++) {
    const y = 0.65 + floor * 0.28;
    floorWindows.push({ mesh: cbx(1.64, 0.07, 0.035, warmWindow.clone(), hqX, y, 0.315), floor });
  }
  for (let col = 0; col < 7; col++) {
    cbx(0.035, 2.25, 0.035, glass, -1.55 + col * 0.27, 1.73, 0.335);
  }
  cbx(0.04, 2.45, 1.12, glass, -1.77, 1.63, hqZ);
  cbx(0.04, 2.45, 1.12, glass, 0.27, 1.63, hqZ);

  const beam = add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 4.0, 12, 1, true), skyBeamMat),
  ) as THREE.Mesh;
  beam.position.set(hqX, 5.2, hqZ);
  const beamBase = cbx(0.18, 0.06, 0.18, circuitTrace, hqX, 3.22, hqZ);

  const roofSign = samsungSign(hqX, 3.45, 0.08, 1.72, 0.46);
  roofSign.rotation.x = -Math.PI / 8;
  cbx(0.05, 0.38, 0.05, silver, -1.28, 3.25, 0.02);
  cbx(0.05, 0.38, 0.05, silver, -0.22, 3.25, 0.02);
  samsungSign(hqX, 1.85, 0.326, 1.45, 0.46);

  add(cy(0.04, 0.25, metalGrey, -1.45, 3.095, -0.95, 12));
  const dishPivot = new THREE.Group();
  dishPivot.position.set(-1.45, 3.4, -0.95);
  add(dishPivot);
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2),
    silver,
  );
  dish.rotation.x = Math.PI;
  dish.position.set(0, 0.05, 0);
  dishPivot.add(dish);
  const dishAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), metalGrey);
  dishAntenna.position.set(0, 0.15, 0);
  dishPivot.add(dishAntenna);
  const dishLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xff3355 }),
  );
  dishLed.position.set(0, 0.3, 0);
  dishPivot.add(dishLed);

  const fabPositions: [number, number, number, string][] = [
    [1.35, 0.6, -1.15, 'DRAM'],
    [1.35, 0.6, 0.05, 'NAND'],
    [1.35, 0.6, 1.02, 'FOUNDRY'],
  ];
  const fabScanLines: { mesh: THREE.Mesh; phase: number }[] = [];
  fabPositions.forEach(([x, y, z, label], i) => {
    cbx(1.0, 1.2, 1.0, white, x, y, z);
    cbx(1.06, 0.08, 1.06, blueLight, x, 1.23, z);
    cbx(0.72, 0.32, 0.035, glass, x, 0.7, z + 0.51);
    fabProductBoard(label, x - 0.51, 0.75, z, 0.45, 0.85);
    const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.03), scanLineMat.clone());
    scanLine.position.set(x, 1.0, z + 0.528);
    add(scanLine);
    fabScanLines.push({ mesh: scanLine, phase: i * 0.33 });
  });

  createDRAM(1.05, 1.27, -1.35, 0.9);
  createDRAM(1.55, 1.27, -1.35, 0.9).rotation.y = Math.PI / 8;
  createDRAM(1.3, 1.27, -1.0, 0.9).rotation.y = Math.PI / 4;
  productLabel('DRAM', 1.3, 1.45, -1.6, 0.4, 0.1);

  createSSD(1.05, 1.275, -0.15, 1.0);
  createSSD(1.55, 1.275, -0.15, 1.0).rotation.y = Math.PI / 6;
  createSSD(1.3, 1.275, 0.25, 1.0).rotation.y = Math.PI / 3;
  productLabel('SSD / V-NAND', 1.3, 1.45, -0.4, 0.5, 0.1);

  createWaferDisc(1.1, 1.27, 0.82, 1.0);
  createWaferDisc(1.55, 1.27, 1.22, 1.0);
  productLabel('FOUNDRY 웨이퍼', 1.3, 1.45, 0.62, 0.5, 0.1);

  type SteamBead = {
    mesh: THREE.Mesh;
    baseX: number;
    baseY: number;
    baseZ: number;
    offset: number;
    speed: number;
  };
  const steamBeads: SteamBead[] = [];
  const vents: [number, number, number][] = [
    [1.08, 1.45, -1.55],
    [1.62, 1.45, -1.0],
    [1.12, 1.45, 0.25],
    [1.62, 1.45, 0.04],
    [1.35, 1.45, 1.2],
  ];
  vents.forEach(([x, y, z], i) => {
    add(cy(0.1, 0.4, metalGrey, x, y - 0.2, z, 24));
    add(cy(0.12, 0.05, silver, x, y + 0.205, z, 24));
    for (let j = 0; j < 3; j++) {
      const steam = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }),
      );
      steam.castShadow = false;
      add(steam);
      steamBeads.push({
        mesh: steam,
        baseX: x,
        baseY: y + 0.3,
        baseZ: z,
        offset: (i * 3 + j) / (vents.length * 3),
        speed: 0.1 + (i * 3 + j) * 0.01,
      });
    }
  });

  const wafer = add(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.035, 40),
      new THREE.MeshStandardMaterial({
        color: 0x9ad5ff,
        roughness: 0.18,
        metalness: 0.35,
        emissive: 0x245dff,
        emissiveIntensity: 0.25,
      }),
    ),
  ) as THREE.Mesh;
  wafer.position.set(0.2, 0.16, 1.02);
  wafer.rotation.x = Math.PI / 2;

  type DataBead = { mesh: THREE.Mesh; light: THREE.PointLight; offset: number };
  type DataPath = { curve: THREE.CatmullRomCurve3; beads: DataBead[]; speed: number };
  const dataPaths: DataPath[] = [];
  const fabSplashLights: THREE.PointLight[] = [];

  fabPositions.forEach(([fx, , fz], idx) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 1.0, hqZ),
      new THREE.Vector3(0.6, 0.9, (fz + hqZ) / 2),
      new THREE.Vector3(fx - 0.5, 0.95, fz),
    ]);
    const beads: DataBead[] = [];
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), beadMat);
      b.castShadow = false;
      const beadLight = new THREE.PointLight(0x9be3ff, 0.2, 0.6);
      b.add(beadLight);
      add(b);
      beads.push({ mesh: b, light: beadLight, offset: i / 5 });
    }
    const splashLight = new THREE.PointLight(0x9be3ff, 0, 1.5);
    splashLight.position.set(fx - 0.5, 1.1, fz);
    add(splashLight);
    fabSplashLights.push(splashLight);
    dataPaths.push({ curve, beads, speed: 0.16 + idx * 0.02 });
  });

  const conveyorY = 0.16;
  const conveyorZ = 0.85;
  cbx(3.6, 0.06, 0.35, conveyorBase, 0, conveyorY, conveyorZ);
  cbx(3.6, 0.02, 0.32, conveyorBelt, 0, conveyorY + 0.035, conveyorZ);
  const rollerL = add(cy(0.05, 0.35, metalGrey, -1.85, conveyorY + 0.02 - 0.175, conveyorZ, 12));
  rollerL.rotation.x = Math.PI / 2;
  const rollerR = add(cy(0.05, 0.35, metalGrey, 1.85, conveyorY + 0.02 - 0.175, conveyorZ, 12));
  rollerR.rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const lx = -1.6 + i * 1.07;
    cbx(0.04, 0.08, 0.04, metalGrey, lx, conveyorY - 0.04, conveyorZ + 0.12);
    cbx(0.04, 0.08, 0.04, metalGrey, lx, conveyorY - 0.04, conveyorZ - 0.12);
  }

  const conveyorProducts: { group: THREE.Group; offset: number }[] = [];
  const productTypes = ['phone', 'dram', 'tv', 'ssd', 'phone', 'dram'] as const;
  productTypes.forEach((type, i) => {
    const offset = i / productTypes.length;
    const productGroup = new THREE.Group();
    const pkg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), packageBox);
    productGroup.add(pkg);
    if (type === 'phone') {
      const mini = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.005), phoneBody);
      mini.position.set(0, 0.07, 0);
      productGroup.add(mini);
    } else if (type === 'dram') {
      const mini = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.005), dramPCB);
      mini.position.set(0, 0.07, 0);
      productGroup.add(mini);
    } else if (type === 'tv') {
      const mini = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.005), tvFrame);
      mini.position.set(0, 0.07, 0);
      productGroup.add(mini);
    } else if (type === 'ssd') {
      const mini = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.04), ssdBody);
      mini.position.set(0, 0.07, 0);
      productGroup.add(mini);
    }
    productGroup.position.set(-1.7 + offset * 3.5, conveyorY + 0.1, conveyorZ);
    add(productGroup);
    conveyorProducts.push({ group: productGroup, offset });
  });

  const phoneDisp = createPhone(-0.95, 0.46, 0.6, 1.1);
  const tvDisp = createTV(-0.4, 0.45, 0.6, 0.9);
  createDRAM(-1.55, 0.46, 0.6, 1.0);
  productLabel('Galaxy', -0.95, 0.68, 0.6, 0.18, 0.06);
  productLabel('QLED TV', -0.4, 0.68, 0.6, 0.22, 0.06);
  productLabel('DRAM', -1.55, 0.68, 0.6, 0.18, 0.06);

  const roofPhone1 = createPhone(-1.45, 3.13, 0.15, 0.7);
  roofPhone1.group.rotation.x = -Math.PI / 8;
  roofPhone1.group.rotation.z = -Math.PI / 12;
  const roofPhone2 = createPhone(-0.05, 3.13, 0.15, 0.7);
  roofPhone2.group.rotation.x = -Math.PI / 8;
  roofPhone2.group.rotation.z = Math.PI / 12;

  const phones = [phoneDisp, roofPhone1, roofPhone2];
  const tvs = [tvDisp];

  cbx(0.32, 0.28, 0.32, blue, 0.45, 0.24, 1.6);
  cbx(0.58, 0.34, 0.34, white, 0.82, 0.28, 1.6);
  cbx(0.35, 0.12, 0.22, white, -1.9, 0.13, 0.5);

  createTree(-2.0, -1.55, 0.48);
  createTree(2.0, -1.55, 0.46);
  createTree(2.0, 1.55, 0.42);

  const glow = new THREE.PointLight(0xfff2c8, 0.5, 3);
  glow.position.set(hqX, 1.5, hqZ);
  add(glow);
  const fabGlow = new THREE.PointLight(0x4d8dff, 0.7, 3.5);
  fabGlow.position.set(1.35, 1.2, -0.25);
  add(fabGlow);
  const displayGlow = new THREE.PointLight(0xfff8e0, 0.6, 1.8);
  displayGlow.position.set(-0.9, 0.7, 0.7);
  add(displayGlow);

  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;

    floorWindows.forEach((fw) => {
      const wave = 0.4 + 0.6 * Math.max(0, Math.sin(t * 1.2 - fw.floor * 0.4));
      (fw.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = wave;
    });

    steamBeads.forEach((s) => {
      const phase = ((tRaw * s.speed) + s.offset) % 1;
      s.mesh.position.set(
        s.baseX + Math.sin(t * 2 + s.offset * 6) * 0.05,
        s.baseY + phase * 0.8,
        s.baseZ + Math.cos(t * 2 + s.offset * 6) * 0.05,
      );
      (s.mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - phase);
      s.mesh.scale.setScalar(1 + phase * 0.8);
    });

    dataPaths.forEach((path, pIdx) => {
      const tempo = 0.8 + 0.4 * Math.sin(t * 2);
      path.beads.forEach((b, idx) => {
        const progress = ((tRaw * path.speed * tempo) + b.offset) % 1;
        b.mesh.position.copy(path.curve.getPoint(progress));
        (b.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          1.5 + 0.7 * Math.sin(t * 6 + idx);
        b.light.intensity = 0.2 + 0.15 * Math.sin(t * 7 + idx);
        if (progress > 0.9) {
          fabSplashLights[pIdx]!.intensity = 2.0 * (progress - 0.9) / 0.1;
        }
      });
      fabSplashLights[pIdx]!.intensity *= 0.93;
    });

    fabScanLines.forEach((s) => {
      const phase = ((t * 0.5) + s.phase) % 1;
      const yMin = 0.55;
      const yMax = 0.85;
      s.mesh.position.y = yMax - phase * (yMax - yMin);
      (s.mesh.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - Math.abs(phase - 0.5) * 1.5);
    });

    dishPivot.rotation.y = t * 0.6;
    (dishLed.material as THREE.MeshBasicMaterial).color.setHSL(0, 1, 0.5 + 0.25 * Math.sin(tRaw * 4));

    skyBeamMat.opacity = 0.25 + 0.2 * Math.sin(t * 1.5);
    beam.scale.x = beam.scale.z = 1 + 0.15 * Math.sin(t * 2);
    (beamBase.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + 1.5 * Math.sin(t * 3);

    conveyorProducts.forEach((p) => {
      const progress = ((t * 0.12) + p.offset) % 1;
      p.group.position.x = -1.75 + progress * 3.5;
    });

    phones.forEach((p, i) => {
      (p.screen.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.0 + 0.5 * Math.sin(t * 1.5 + i);
    });

    tvs.forEach((tv, i) => {
      (tv.screen.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.7 + 0.3 * Math.sin(t * 1.0 + i);
    });

    root.rotation.y = Math.sin(t * 0.25) * 0.012;
  };

  return root;
}

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

// ── Tesla: 1셀 슬림 · Factory + Supercharger Edition (TSLA) ──
export function createTesla(): THREE.Group {
  const teslaRedSign = new THREE.MeshStandardMaterial({
    color: 0xe82127,
    roughness: 0.25,
    emissive: 0xe82127,
    emissiveIntensity: 0.8,
  });
  const robotArmMat = new THREE.MeshStandardMaterial({
    color: 0xe82127,
    roughness: 0.3,
    metalness: 0.4,
    emissive: 0xa01418,
    emissiveIntensity: 0.15,
  });
  const glassFactory = new THREE.MeshStandardMaterial({
    color: 0x7eb5e0,
    roughness: 0.1,
    metalness: 0.15,
    transparent: true,
    opacity: 0.45,
    emissive: 0x5a98c0,
    emissiveIntensity: 0.2,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xa0c8f0,
    roughness: 0.12,
    metalness: 0.15,
    transparent: true,
    opacity: 0.55,
    emissive: 0x3a78a0,
    emissiveIntensity: 0.15,
  });
  const warmWindow = new THREE.MeshStandardMaterial({
    color: 0xfff2c8,
    roughness: 0.35,
    emissive: 0xffb93d,
    emissiveIntensity: 0.65,
  });
  const solarPanelMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.25,
    metalness: 0.55,
    emissive: 0x0a1a4a,
    emissiveIntensity: 0.35,
  });
  const scScreenMat = new THREE.MeshStandardMaterial({
    color: 0x0a1a3a,
    emissive: 0x1e4dcc,
    emissiveIntensity: 0.8,
  });
  const black = mat(0x0a0a0e, 0.35, 0.35);
  const darkGray = mat(0x1a1a1f, 0.5, 0.25);
  const midGray = mat(0x3a3a42, 0.55, 0.35);
  const darkMetal = mat(0x444444, 0.3, 0.8);
  const glassDark = mat(0x15252e, 0.2, 0.5);
  const whiteAccent = mat(0xffffff, 0.55);
  const silver = mat(0xcfd4dc, 0.42, 0.55);
  const whiteCar = mat(0xf4f4f4, 0.35, 0.35);
  const redCar = mat(0xe82127, 0.35, 0.35);
  const blackCar = mat(0x1a1a1f, 0.35, 0.45);
  const megapackMat = mat(0x1a1a1f, 0.45, 0.3);
  const basePlinth = mat(0x08080c, 0.55);
  const platform = mat(0x252830, 0.82);
  const road = mat(0x1a1a20, 0.9);
  const grass = mat(0x4a8c52, 0.9);
  const roadLine = mat(0xfffae0, 0.65);
  const asphalt = mat(0x1e1e24, 0.9);
  const wheelMat = mat(0x1a1a1a, 0.8);
  const hoseMat = mat(0x1a1a1a, 0.8);
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff8c0 });
  const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff2233 });
  const chargerLedMat = new THREE.MeshBasicMaterial({ color: 0x3affae });
  const gripperLedMat = new THREE.MeshBasicMaterial({ color: 0xff2233 });
  const workLightMat = new THREE.MeshBasicMaterial({ color: 0xfff8c0 });
  const skyBeamMat = new THREE.MeshBasicMaterial({ color: 0xff2233, transparent: true, opacity: 0.35 });

  const root = new THREE.Group();
  const add = (o: THREE.Object3D) => {
    root.add(o);
    return o;
  };
  const cbx = (sx: number, sy: number, sz: number, m: THREE.Material, x: number, y: number, z: number) =>
    add(bx(sx, sy, sz, m, x, y - sy / 2, z)) as THREE.Mesh;

  const makeTeslaLogoTexture = (bgColor = '#1a1a1f', useRed = true) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = useRed ? '#e82127' : '#ffffff';
    ctx.font = 'bold 130px Arial, sans-serif';
    const text = 'TESLA';
    const letterSpacing = 30;
    const totalWidth = ctx.measureText(text).width + (text.length - 1) * letterSpacing;
    let lx = canvas.width / 2 - totalWidth / 2;
    for (let i = 0; i < text.length; i++) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text[i]!, lx, canvas.height / 2);
      lx += ctx.measureText(text[i]!).width + letterSpacing;
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeTeslaTLogoTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e82127';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 50, 176, 40);
    ctx.fillRect(108, 50, 40, 160);
    ctx.beginPath();
    ctx.arc(128, 210, 20, 0, Math.PI, false);
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeSuperchargerSign = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e82127';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(180, 50);
    ctx.lineTo(230, 110);
    ctx.lineTo(200, 110);
    ctx.lineTo(240, 200);
    ctx.lineTo(180, 130);
    ctx.lineTo(210, 130);
    ctx.lineTo(180, 50);
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 38px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUPER', 260, 110);
    ctx.fillText('CHARGER', 260, 156);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeRDSign = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1a1a1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 90px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TESLA R&D CENTER', canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeStockBoardTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e82127';
    ctx.fillRect(0, 0, canvas.width, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TESLA', canvas.width / 2, 50);
    ctx.fillStyle = '#0a0a0e';
    ctx.fillRect(0, 100, canvas.width, canvas.height - 100);
    const data: [string, string][] = [
      ['TSLA', '248.48'],
      ['PER', '62.31'],
      ['시가총액', '789.1B'],
      ['매출', '96.8B'],
      ['영업이익', '8.9B'],
      ['EPS', '2.42'],
    ];
    data.forEach(([k, v], i) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(k, 20, 145 + i * 38);
      ctx.textAlign = 'right';
      ctx.fillStyle = i === 0 ? '#3affae' : '#ffffff';
      ctx.fillText(v, canvas.width - 20, 145 + i * 38);
    });
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const makeMissionTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e82127';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TESLA', canvas.width / 2, 60);
    ctx.fillStyle = '#1a1a1f';
    ctx.font = 'bold 30px Arial';
    ['Accelerate the', "World's Transition", 'to Sustainable', 'Energy'].forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, 150 + i * 50);
    });
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

  const carBox = (g: THREE.Group, x: number, y: number, z: number, sx: number, sy: number, sz: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  };

  const createTeslaCar = (x: number, y: number, z: number, color: THREE.Material, scale = 1, withLights = false) => {
    const carGroup = new THREE.Group();
    carGroup.position.set(x, y, z);
    carGroup.scale.setScalar(scale);
    add(carGroup);

    carBox(carGroup, 0, 0, 0, 0.32, 0.09, 0.16, color);
    carBox(carGroup, 0, 0.075, 0, 0.24, 0.05, 0.14, color);
    carBox(carGroup, 0.08, 0.075, 0, 0.04, 0.045, 0.13, glassDark);
    carBox(carGroup, -0.08, 0.075, 0, 0.04, 0.045, 0.13, glassDark);
    carBox(carGroup, 0, 0.08, 0.071, 0.18, 0.04, 0.005, glassDark);
    carBox(carGroup, 0, 0.08, -0.071, 0.18, 0.04, 0.005, glassDark);

    if (withLights) {
      [[0.16, 0.05], [0.16, -0.05]].forEach(([hx, hz]) => {
        const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), headlightMat);
        hl.position.set(hx, 0, hz);
        carGroup.add(hl);
      });
      [[-0.16, 0.05], [-0.16, -0.05]].forEach(([tx, tz]) => {
        const tl = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), taillightMat);
        tl.position.set(tx, 0.005, tz);
        carGroup.add(tl);
      });
    }

    [[-0.1, 0.075], [0.1, 0.075], [-0.1, -0.075], [0.1, -0.075]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.025, 10), wheelMat);
      wheel.position.set(wx, -0.045, wz);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    return carGroup;
  };

  type RobotArm = {
    pivot: THREE.Group;
    upperArm: THREE.Group;
    gripperLed: THREE.Mesh;
    basePhase: number;
  };

  const createRobotArm = (x: number, y: number, z: number, scale = 1, basePhase = 0): RobotArm => {
    const armGroup = new THREE.Group();
    armGroup.position.set(x, y, z);
    armGroup.scale.setScalar(scale);
    add(armGroup);

    const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), darkMetal);
    baseCyl.position.set(0, 0, 0);
    baseCyl.castShadow = true;
    armGroup.add(baseCyl);

    const pivotCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12), robotArmMat);
    pivotCyl.position.set(0, 0.06, 0);
    pivotCyl.castShadow = true;
    armGroup.add(pivotCyl);

    const armPivot = new THREE.Group();
    armPivot.position.set(0, 0.12, 0);
    armGroup.add(armPivot);

    carBox(armPivot, 0, 0.12, 0, 0.04, 0.24, 0.04, robotArmMat);
    const joint1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), darkMetal);
    joint1.position.set(0, 0.24, 0);
    joint1.castShadow = true;
    armPivot.add(joint1);

    const upperArm = new THREE.Group();
    upperArm.position.set(0, 0.24, 0);
    upperArm.rotation.z = -Math.PI / 3;
    armPivot.add(upperArm);

    carBox(upperArm, 0.1, 0, 0, 0.2, 0.035, 0.035, robotArmMat);

    const gripper = new THREE.Group();
    gripper.position.set(0.2, 0, 0);
    upperArm.add(gripper);
    const joint2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), darkMetal);
    joint2.castShadow = true;
    gripper.add(joint2);
    carBox(gripper, 0.04, 0, 0, 0.06, 0.025, 0.025, darkMetal);
    const gripperLed = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 8), gripperLedMat);
    gripperLed.position.set(0.08, 0, 0);
    gripper.add(gripperLed);

    return { pivot: armPivot, upperArm, gripperLed, basePhase };
  };

  const createSupercharger = (x: number, y: number, z: number) => {
    const sc = new THREE.Group();
    sc.position.set(x, y, z);
    add(sc);

    carBox(sc, 0, 0.18, 0, 0.1, 0.36, 0.08, whiteAccent);
    carBox(sc, 0, 0.32, 0.041, 0.08, 0.06, 0.005, teslaRedSign);
    carBox(sc, 0, 0.22, 0.041, 0.06, 0.04, 0.005, scScreenMat);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), chargerLedMat.clone());
    led.position.set(0, 0.27, 0.045);
    sc.add(led);
    const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 6), hoseMat);
    hose.position.set(0.045, 0.15, 0.02);
    hose.rotation.z = Math.PI / 4;
    hose.castShadow = true;
    sc.add(hose);

    return { group: sc, led };
  };

  const createTree = (x: number, z: number, s = 0.5) => {
    add(cy(0.035, 0.38 * (s / 0.5), mat(0x7a4b2a, 0.8), x, 0.04 * (s / 0.5), z, 10));
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.18 * (s / 0.5), 18, 12), grass);
    crown.position.set(x, 0.52 * (s / 0.5), z);
    crown.castShadow = crown.receiveShadow = true;
    add(crown);
  };

  // ── Base ──
  cbx(gx(4.8), 0.26, gx(4.3), basePlinth, 0, -0.13, 0);
  cbx(gx(4.35), 0.12, gx(3.85), platform, 0, 0.02, 0);
  cbx(gx(4.0), 0.04, gx(0.55), road, 0, 0.105, 1.5);
  for (let i = 0; i < 8; i++) {
    cbx(0.2, 0.005, 0.025, roadLine, -1.6 + i * 0.45, 0.135, 1.5);
  }

  // ── Main factory ──
  cbx(2.4, 1.9, 1.4, darkGray, 0.0, 0.95, -0.5);
  cbx(2.45, 0.1, 1.45, black, 0.0, 1.94, -0.5);
  cbx(0.25, 0.1, 0.35, midGray, -0.8, 2.04, -0.5);
  cbx(0.25, 0.1, 0.35, midGray, 0.8, 2.04, -0.5);
  cbx(2.2, 1.1, 0.03, glassFactory, 0.0, 0.7, 0.21);
  cbx(2.3, 0.25, 0.015, darkGray, 0.0, 1.5, 0.215);

  const teslaSign = add(planeWith(makeTeslaLogoTexture('#1a1a1f', true), 0.0, 1.5, 0.225, 2.0, 0.22, 0.7));

  cbx(0.2, 1.9, 0.015, teslaRedSign, 1.15, 1.0, 0.21);
  add(planeWith(makeTeslaTLogoTexture(), 1.15, 1.4, 0.22, 0.16, 0.16, 0.5));

  const roofSign = add(planeWith(makeTeslaLogoTexture('#ffffff', true), 0.0, 2.4, 0.15, 1.6, 0.38, 0.4));
  roofSign.rotation.x = -Math.PI / 10;
  cbx(0.05, 0.4, 0.05, darkMetal, -0.5, 2.15, 0.1);
  cbx(0.05, 0.4, 0.05, darkMetal, 0.5, 2.15, 0.1);

  // ── Factory cars + robot arms ──
  const factoryCars: THREE.Group[] = [];
  [
    [-0.85, 0.4, -0.5, whiteCar],
    [-0.4, 0.4, -0.5, blackCar],
    [0.05, 0.4, -0.5, whiteCar],
    [0.5, 0.4, -0.5, redCar],
    [0.95, 0.4, -0.5, blackCar],
  ].forEach(([cx, cy, cz, color]) => {
    factoryCars.push(createTeslaCar(cx as number, cy as number, cz as number, color as THREE.Material));
  });

  const robotArms: RobotArm[] = [];
  [
    [-1.05, 0.32, -0.3],
    [-1.05, 0.32, -0.7],
    [-0.6, 0.32, -0.3],
    [-0.15, 0.32, -0.3],
    [0.3, 0.32, -0.3],
    [0.75, 0.32, -0.3],
  ].forEach(([rx, ry, rz], i) => {
    robotArms.push(createRobotArm(rx, ry, rz, 1.0, i * 0.4));
  });

  const workLights: THREE.Mesh[] = [];
  [-0.7, 0, 0.7].forEach(wx => {
    const wl = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), workLightMat);
    wl.position.set(wx, 1.55, -0.5);
    add(wl);
    workLights.push(wl);
    const pl = new THREE.PointLight(0xfff8c0, 0.6, 1.5);
    pl.position.set(wx, 1.4, -0.5);
    add(pl);
  });

  // ── Supercharger canopy ──
  cbx(1.0, 0.02, 0.95, asphalt, 1.85, 0.13, 0.45);
  cbx(1.05, 0.04, 1.0, solarPanelMat, 1.85, 0.5, 0.45);

  const canopyPanels: { mesh: THREE.Mesh; phase: number }[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const px = 1.55 + col * 0.2;
      const pz = 0.13 + row * 0.22;
      canopyPanels.push({
        mesh: cbx(0.16, 0.005, 0.18, solarPanelMat.clone(), px, 0.525, pz),
        phase: (row * 4 + col) * 0.15,
      });
    }
  }

  [[1.4, 0.05], [2.3, 0.05], [1.4, 0.85], [2.3, 0.85]].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 12), darkMetal);
    col.position.set(cx, 0.32, cz);
    col.castShadow = true;
    add(col);
  });

  const superchargers: { group: THREE.Group; led: THREE.Mesh }[] = [];
  [
    [1.6, 0.05, 0.25], [1.85, 0.05, 0.25], [2.1, 0.05, 0.25],
    [1.6, 0.05, 0.65], [1.85, 0.05, 0.65], [2.1, 0.05, 0.65],
  ].forEach(([sx, sy, sz]) => {
    superchargers.push(createSupercharger(sx, sy, sz));
  });

  const chargingCars: THREE.Group[] = [];
  [
    [1.6, 0.18, 0.4, whiteCar],
    [1.85, 0.18, 0.4, redCar],
    [1.6, 0.18, 0.8, blackCar],
    [2.1, 0.18, 0.8, whiteCar],
  ].forEach(([cx, cy, cz, color]) => {
    chargingCars.push(createTeslaCar(cx as number, cy as number, cz as number, color as THREE.Material, 0.9, true));
  });

  const scSign = add(planeWith(makeSuperchargerSign(), 1.2, 0.42, 0.45, 0.25, 0.5, 0.5));
  scSign.rotation.y = Math.PI / 2;
  cbx(0.08, 0.6, 0.18, teslaRedSign, 1.2, 0.3, 0.45);

  // ── Solar array + powerwalls ──
  cbx(0.7, 0.04, 0.5, darkGray, -1.85, 0.17, -1.6);
  const solarCells: { mesh: THREE.Mesh; phase: number }[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const sx = -2.1 + col * 0.18;
      const sz = -1.75 + row * 0.15;
      solarCells.push({
        mesh: cbx(0.16, 0.005, 0.12, solarPanelMat.clone(), sx, 0.195, sz),
        phase: (row * 4 + col) * 0.18,
      });
    }
  }
  cbx(0.04, 0.18, 0.04, darkMetal, -2.1, 0.08, -1.6);
  cbx(0.04, 0.18, 0.04, darkMetal, -1.55, 0.08, -1.6);

  [
    [-1.7, 0.25, -1.1],
    [-1.5, 0.25, -1.1],
    [-1.3, 0.25, -1.1],
  ].forEach(([px, py, pz], i) => {
    cbx(0.16, 0.3, 0.06, whiteCar, px, py, pz);
    cbx(0.03, 0.04, 0.005, teslaRedSign, px, 0.32, pz + 0.035);
  });

  // ── Megapacks ──
  [
    [1.7, 0.3, -1.5],
    [1.95, 0.3, -1.5],
    [2.2, 0.3, -1.5],
  ].forEach(([mx, my, mz]) => {
    cbx(0.22, 0.55, 0.35, megapackMat, mx, my, mz);
    cbx(0.18, 0.02, 0.04, whiteCar, mx, my + 0.32, mz);
    add(planeWith(makeTeslaTLogoTexture(), mx, my, mz + 0.18, 0.06, 0.06, 0.4));
  });

  // ── R&D center ──
  cbx(0.55, 0.85, 0.7, midGray, -1.85, 0.42, 0.0);
  cbx(0.6, 0.04, 0.75, darkGray, -1.85, 0.86, 0.0);
  cbx(0.5, 0.6, 0.025, glass, -1.85, 0.45, 0.35);

  const rdWindows: { mesh: THREE.Mesh; phase: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const ry = 0.2 + (i % 2) * 0.3;
    const rx = -2.05 + Math.floor(i / 2) * 0.4;
    rdWindows.push({
      mesh: cbx(0.16, 0.18, 0.01, warmWindow.clone(), rx, ry, 0.36),
      phase: i * 0.3,
    });
  }
  add(planeWith(makeRDSign(), -1.85, 0.78, 0.36, 0.5, 0.1, 0.4));

  // ── Stock board ──
  cbx(0.05, 0.85, 0.35, darkMetal, -2.2, 0.45, 0.7);
  const stockBoardTex = makeStockBoardTexture();
  const stockBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.72),
    new THREE.MeshStandardMaterial({
      map: stockBoardTex,
      side: THREE.DoubleSide,
      emissive: 0xffffff,
      emissiveMap: stockBoardTex,
      emissiveIntensity: 0.5,
    }),
  );
  stockBoard.position.set(-2.17, 0.45, 0.7);
  stockBoard.rotation.y = Math.PI / 2;
  add(stockBoard);

  // ── Showroom ──
  cbx(0.6, 0.5, 0.4, darkGray, 0.5, 0.32, 0.95);
  cbx(0.65, 0.04, 0.45, black, 0.5, 0.58, 0.95);
  cbx(0.55, 0.45, 0.025, glass, 0.5, 0.3, 1.15);
  createTeslaCar(0.5, 0.18, 0.95, whiteCar, 0.8);
  add(planeWith(makeTeslaLogoTexture('#1a1a1f', true), 0.5, 0.45, 1.165, 0.4, 0.08, 0.4));

  // ── Mission sign ──
  cbx(0.05, 0.5, 0.4, midGray, 2.25, 0.4, 1.4);
  add(planeWith(makeMissionTexture(), 2.22, 0.4, 1.4, 0.32, 0.42, 0.3));

  // ── Driving car + sky beam ──
  const drivingCar = createTeslaCar(-0.5, 0.18, 1.5, whiteCar, 1.0, true);

  const teslaBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.13, 3.5, 12, 1, true),
    skyBeamMat,
  );
  teslaBeam.position.set(0.0, 4.3, 0.0);
  teslaBeam.castShadow = false;
  add(teslaBeam);

  // ── Trees ──
  createTree(-2.1, 1.2, 0.48);
  createTree(-2.1, -1.95, 0.42);
  createTree(0.0, -1.95, 0.42);

  // ── Lights ──
  const heroGlow = new THREE.PointLight(0xfff2c8, 0.5, 3);
  heroGlow.position.set(0.0, 1.0, -0.5);
  add(heroGlow);
  const redRim = new THREE.PointLight(0xe82127, 0.9, 3.5);
  redRim.position.set(0.0, 1.7, 0.4);
  add(redRim);
  const scGlow = new THREE.PointLight(0xff2233, 0.6, 2.5);
  scGlow.position.set(1.85, 0.4, 0.45);
  add(scGlow);
  const rdGlow = new THREE.PointLight(0xfff2c8, 0.4, 2);
  rdGlow.position.set(-1.85, 0.5, 0);
  add(rdGlow);

  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;

    rdWindows.forEach(rw => {
      const wave = 0.5 + 0.5 * Math.max(0, Math.sin(t * 1.2 + rw.phase * 2));
      (rw.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = wave;
    });

    robotArms.forEach(arm => {
      arm.pivot.rotation.y = Math.sin(t * 1.2 + arm.basePhase) * 0.4;
      arm.upperArm.rotation.z = -Math.PI / 3 + Math.sin(t * 1.5 + arm.basePhase) * 0.15;
      (arm.gripperLed.material as THREE.MeshBasicMaterial).color.setRGB(
        1,
        0.15 + 0.1 * Math.sin(t * 6 + arm.basePhase * 3),
        0.2,
      );
    });

    superchargers.forEach((sc, i) => {
      const phase = (t * 1.5 + i * 0.4) % 1;
      const ledMat = sc.led.material as THREE.MeshBasicMaterial;
      if (phase < 0.7) {
        ledMat.color.setRGB(0.2, 1, 0.55);
      } else {
        ledMat.color.setRGB(1, 0.2, 0.3);
      }
    });

    canopyPanels.forEach(p => {
      (p.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.25 + 0.3 * Math.max(0, Math.sin(t * 1.5 + p.phase));
    });
    solarCells.forEach(p => {
      (p.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + 0.35 * Math.max(0, Math.sin(t * 1.5 + p.phase));
    });

    workLights.forEach((wl, i) => {
      (wl.material as THREE.MeshBasicMaterial).color.setRGB(
        1,
        0.95 + 0.05 * Math.sin(t * 3 + i),
        0.75,
      );
    });

    (teslaSign.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 1.5);
    redRim.intensity = 0.7 + 0.4 * Math.sin(t * 1.5);

    skyBeamMat.opacity = 0.3 + 0.15 * Math.sin(t * 1.5);
    teslaBeam.scale.x = teslaBeam.scale.z = 1 + 0.13 * Math.sin(t * 2);

    drivingCar.position.x = -1.5 + (Math.sin(t * 0.4) + 1) * 1.5;
    drivingCar.rotation.y = Math.cos(t * 0.4) < 0 ? Math.PI : 0;

    root.rotation.y = Math.sin(t * 0.25) * 0.012;
  };

  return root;
}

// ── Apple Campus: ring HQ ─────────────────────────────────────────────────────
export function createAppleCampus(): THREE.Group {
  const white = mat(0xf2f2f0, 0.25, 0.05);
  const glass = mat(0xaaccee, 0.05, 0.12);
  const dark  = mat(0x1a1a1a, 0.5, 0.2);
  const green = mat(0x3a9a3a, 0.8);
  const floor = mat(0xd0d0c8, 0.7);
  return grp(
    bx(gx(4.2), 0.18, gx(4.2), floor,         0,    0,    0),    // ground
    // ring walls (side panels span full Z; front/back fit between)
    bx(0.55, 1.8, 4.2, white,         1.7,  0.18, 0),    // right arc
    bx(0.55, 1.8, 4.2, white,        -1.7,  0.18, 0),    // left arc
    bx(2.9,  1.8, 0.55, white,        0,    0.18, 1.7),  // front arc
    bx(2.9,  1.8, 0.55, white,        0,    0.18, -1.7), // back arc
    bx(4.2,  0.18, 4.2, glass,        0,    1.98, 0),    // glass roof
    bx(2.2,  0.5,  2.2, green,        0,    0.18, 0),    // inner courtyard
    cy(0.62, 0.5, dark,               0,    2.16, 0,  8), // roof cap
    bx(1.2,  0.08, 0.65, glass,       0,    1.22, 2.1),  // entrance canopy
  );
}

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
