import fs from 'fs';

const path = new URL('../public/apple-park-value-chain-diorama.html', import.meta.url);
const html = fs.readFileSync(path, 'utf8');
const m = html.match(/<script type="module">([\s\S]*)<\/script>/);
if (!m) throw new Error('no script');
let js = m[1];
js = js.replace(/import[\s\S]*?OrbitControls\.js';\s*/, '');
const buildStart = js.indexOf('// ===== Palette (Apple tone');
const lighting = js.indexOf('// ===== Lighting =====');
if (buildStart < 0 || lighting < 0) throw new Error('markers not found');
let body = js.slice(buildStart, lighting).trim();
body = body.replace(/function createAppleCampus\(\)/, 'function buildAppleCampusDiorama()');

const header = `import * as THREE from 'three';

/** XZ footprint multiplier (matches village ground scale). */
const GROUND_XZ = 1.25;
const gx = (n: number) => n * GROUND_XZ;

type MatOpts = {
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
  side?: THREE.Side;
};

`;

const footer = `
export function createAppleCampus(): THREE.Group {
  const root = buildAppleCampusDiorama();
  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;
    const u = root.userData as AppleCampusRuntime;

    u.parkWindowWaves.forEach((w) => {
      const wave = 0.4 + 0.6 * Math.max(0, Math.sin(t * 1.2 + w.phase * Math.PI * 2));
      (w.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = wave;
    });

    u.dataPaths.forEach((path, pIdx) => {
      path.beads.forEach((b, idx) => {
        const progress = ((tRaw * path.speed) + b.offset) % 1;
        const pos = path.curve.getPoint(progress);
        b.mesh.position.copy(pos);
        const pulse = 1.2 + 0.5 * Math.sin(t * 3 + idx);
        (b.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
        b.light.intensity = 0.16 + 0.1 * Math.sin(t * 3.5 + idx);
        if (progress > 0.92) {
          u.satSplashLights[pIdx].intensity = 1.4 * (progress - 0.92) / 0.08;
        }
      });
      u.satSplashLights[pIdx].intensity *= 0.94;
    });

    u.moneyPaths.forEach((path) => {
      path.coins.forEach((c, idx) => {
        const progress = ((tRaw * path.speed) + c.offset) % 1;
        const pos = path.curve.getPoint(progress);
        c.mesh.position.copy(pos);
        c.mesh.rotation.x = Math.PI / 2;
        c.mesh.rotation.y = tRaw * 4 + idx;
        (c.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          1.4 + 0.4 * Math.sin(t * 2.5 + idx);
      });
    });
    u.goldGlow.intensity = 0.4 + 0.25 * Math.sin(t * 1.5);

    u.cars.forEach((c) => {
      const a = c.baseAngle + tRaw * 0.1;
      c.group.position.x = Math.cos(a) * c.radius;
      c.group.position.z = Math.sin(a) * c.radius;
      c.group.rotation.y = -a + Math.PI / 2;
    });

    if (u.eco) {
      (u.eco.macbook.screen.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.0 + 0.4 * Math.sin(t * 1.4);
      (u.eco.watch.screen.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.1 + 0.4 * Math.sin(t * 1.6);
      (u.eco.iphone.screen.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.1 + 0.4 * Math.sin(t * 1.8);
    }

    root.rotation.y = Math.sin(t * 0.2) * 0.008;
  };
  return root;
}

interface AppleCampusRuntime {
  parkWindowWaves: { mesh: THREE.Mesh; phase: number }[];
  dataPaths: {
    curve: THREE.CatmullRomCurve3;
    beads: { mesh: THREE.Mesh; light: THREE.PointLight; offset: number }[];
    speed: number;
  }[];
  satSplashLights: THREE.PointLight[];
  moneyPaths: {
    curve: THREE.CatmullRomCurve3;
    coins: { mesh: THREE.Mesh; offset: number }[];
    speed: number;
  }[];
  goldGlow: THREE.PointLight;
  cars: { group: THREE.Group; baseAngle: number; radius: number }[];
  eco?: {
    macbook: { screen: THREE.Mesh };
    watch: { screen: THREE.Mesh };
    iphone: { screen: THREE.Mesh };
  };
}
`;

body = body.replace(
  /const mat = \(color, o = \{\}\) =>/,
  'const mat = (color: string, o: MatOpts = {}) =>',
);
body = body.replace(/getContext\('2d'\);/g, "getContext('2d')!;");
body = body.replace(/const cars = \[\];/, 'const cars: { group: THREE.Group; baseAngle: number; radius: number }[] = [];');

const outPath = new URL('../src/scene/appleCampus.ts', import.meta.url);
const out = header + body + footer;
fs.writeFileSync(outPath, out);
console.log('written', out.length, 'chars ->', outPath.pathname);
