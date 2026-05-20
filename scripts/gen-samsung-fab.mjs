import fs from 'fs';

const path = new URL('../public/samsung-electronics-diorama.html', import.meta.url);
const html = fs.readFileSync(path, 'utf8');
const m = html.match(/<script type="module">([\s\S]*)<\/script>/);
if (!m) throw new Error('no script');
let js = m[1];
js = js.replace(/import[\s\S]*?OrbitControls\.js';\s*/, '');
const buildStart = js.indexOf('const C = {');
const lighting = js.indexOf('// ===== Lighting =====');
if (buildStart < 0 || lighting < 0) throw new Error('markers not found');
let body = js.slice(buildStart, lighting).trim();
body = body.replace(/function createSamsungDiorama\(\)/, 'function buildSamsungDiorama()');

const header = `import * as THREE from 'three';

/** XZ footprint multiplier (matches village ground scale). */
const GROUND_XZ = 1.25;
const gx = (n: number) => n * GROUND_XZ;

/** HQ anchor (v4: back-left). */
const HQ_X = -1.55;
const HQ_Z = -1.05;

type MatOpts = {
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
};

type FabType = 'DRAM' | 'NAND' | 'FOUNDRY';

`;

const footer = `
export function createSamsungFab(): THREE.Group {
  const root = buildSamsungDiorama();
  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;
    const u = root.userData as SamsungFabRuntime;

    u.floorWindows.forEach((fw) => {
      const wave = 0.4 + 0.6 * Math.max(0, Math.sin(t * 1.2 - fw.floor * 0.4));
      (fw.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = wave;
    });

    u.steamBeads.forEach((s) => {
      const phase = ((tRaw * s.speed) + s.offset) % 1;
      s.mesh.position.set(
        s.baseX + Math.sin(t * 2 + s.offset * 6) * 0.05,
        s.baseY + phase * 0.8,
        s.baseZ + Math.cos(t * 2 + s.offset * 6) * 0.05,
      );
      (s.mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - phase);
      s.mesh.scale.setScalar(1 + phase * 0.8);
    });

    u.dataPaths.forEach((path, pIdx) => {
      const tempo = 0.8 + 0.2 * Math.sin(t * 1);
      path.beads.forEach((b, idx) => {
        const progress = ((tRaw * path.speed * tempo) + b.offset) % 1;
        b.mesh.position.copy(path.curve.getPoint(progress));
        const pulse = 1.2 + 0.5 * Math.sin(t * 3 + idx);
        (b.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
        b.light.intensity = 0.18 + 0.1 * Math.sin(t * 3.5 + idx);
        if (progress > 0.92) {
          u.fabSplashLights[pIdx].intensity = 1.5 * (progress - 0.92) / 0.08;
        }
      });
      u.fabSplashLights[pIdx].intensity *= 0.94;
    });

    u.moneyPaths.forEach((path) => {
      path.coins.forEach((c, idx) => {
        const progress = ((tRaw * path.speed) + c.offset) % 1;
        c.mesh.position.copy(path.curve.getPoint(progress));
        c.mesh.rotation.x = Math.PI / 2;
        c.mesh.rotation.y = tRaw * 4 + idx;
        (c.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          1.4 + 0.4 * Math.sin(t * 2.5 + idx);
        c.light.intensity = 0.12 + 0.08 * Math.sin(t * 2 + idx);
      });
    });
    u.goldGlow.intensity = 0.4 + 0.25 * Math.sin(t * 1.5);

    u.fabScanLines.forEach((s) => {
      const phase = ((t * 0.5) + s.phase) % 1;
      const yMin = 0.7;
      const yMax = 1.2;
      s.mesh.position.y = yMax - phase * (yMax - yMin);
      (s.mesh.material as THREE.MeshBasicMaterial).opacity =
        0.8 * (1 - Math.abs(phase - 0.5) * 1.5);
    });

    u.dishPivot.rotation.y = t * 0.6;
    (u.dishLed.material as THREE.MeshBasicMaterial).color.setHSL(
      0, 1, 0.5 + 0.25 * Math.sin(tRaw * 4),
    );

    (u.beam.material as THREE.MeshBasicMaterial).opacity = 0.25 + 0.2 * Math.sin(t * 1.5);
    u.beam.scale.x = u.beam.scale.z = 1 + 0.15 * Math.sin(t * 2);
    (u.beamBase.material as THREE.MeshStandardMaterial).emissiveIntensity =
      2 + 1.5 * Math.sin(t * 3);

    u.conveyorProducts.forEach((p) => {
      const progress = ((t * 0.12) + p.offset) % 1;
      p.group.position.x = -1.75 + progress * 3.5;
    });

    u.phones.forEach((p, i) => {
      (p.screen.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.0 + 0.5 * Math.sin(t * 1.5 + i);
    });

    u.tvs.forEach((tv, i) => {
      (tv.screen.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.7 + 0.3 * Math.sin(t * 1.0 + i);
    });

    root.rotation.y = Math.sin(t * 0.25) * 0.012;
  };
  return root;
}

interface SamsungFabRuntime {
  floorWindows: { mesh: THREE.Mesh; floor: number }[];
  beam: THREE.Mesh;
  beamBase: THREE.Mesh;
  dishPivot: THREE.Group;
  dishLed: THREE.Mesh;
  fabScanLines: { mesh: THREE.Mesh; baseX: number; baseZ: number; phase: number }[];
  steamBeads: {
    mesh: THREE.Mesh;
    baseX: number;
    baseY: number;
    baseZ: number;
    offset: number;
    speed: number;
  }[];
  dataPaths: {
    curve: THREE.CatmullRomCurve3;
    beads: { mesh: THREE.Mesh; light: THREE.PointLight; offset: number }[];
    speed: number;
  }[];
  fabSplashLights: THREE.PointLight[];
  moneyPaths: {
    curve: THREE.CatmullRomCurve3;
    coins: { mesh: THREE.Mesh; light: THREE.PointLight; offset: number }[];
    speed: number;
  }[];
  goldGlow: THREE.PointLight;
  conveyorProducts: { group: THREE.Group; offset: number }[];
  phones: { screen: THREE.Mesh }[];
  tvs: { screen: THREE.Mesh }[];
}
`;

body = body.replace(
  /const mat = \(color, o = \{\}\) =>/,
  'const mat = (color: string, o: MatOpts = {}) =>',
);
body = body.replace(/getContext\('2d'\);/g, "getContext('2d')!;");
body = body.replace(
  /function makeFabProductTexture\(fabType\)/,
  'function makeFabProductTexture(fabType: FabType)',
);
body = body.replace(
  /function fabProductBoard\(g, fabType,/,
  'function fabProductBoard(g: THREE.Group, fabType: FabType,',
);

const outPath = new URL('../src/scene/samsungFab.ts', import.meta.url);
fs.writeFileSync(outPath, header + body + footer);
console.log('written ->', outPath.pathname);
