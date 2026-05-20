import fs from 'fs';

const path = new URL('../public/tesla-business-model-diorama.mjs', import.meta.url);
let js = fs.readFileSync(path, 'utf8');
js = js.replace(/import[\s\S]*?OrbitControls\.js';\s*/, '');
const buildStart = js.indexOf('// ===== Palette (Tesla tone');
const lighting = js.indexOf('// ===== Lighting =====');
if (buildStart < 0 || lighting < 0) throw new Error('markers not found');
let body = js.slice(buildStart, lighting).trim();
body = body.replace(/function createTeslaCampus\(\)/, 'function buildTeslaCampusDiorama()');

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
export function createTesla(): THREE.Group {
  const root = buildTeslaCampusDiorama();
  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;
    const u = root.userData as TeslaCampusRuntime;

    u.factoryArms.forEach((arm, i) => {
      arm.shoulder.rotation.y = Math.sin(tRaw * 0.8 + i) * 0.3;
      arm.seg1.rotation.z = -Math.PI / 4 + Math.sin(tRaw * 1.2 + i * 0.5) * 0.2;
      arm.seg2.rotation.z = -Math.PI / 5 + Math.cos(tRaw * 1.0 + i * 0.7) * 0.25;
      (arm.led.material as THREE.MeshBasicMaterial).color.setHSL(
        0.13, 1, 0.5 + 0.3 * Math.sin(tRaw * 5 + i),
      );
    });

    u.dataPaths.forEach((path, pIdx) => {
      path.beads.forEach((b, idx) => {
        const progress = ((tRaw * path.speed) + b.offset) % 1;
        b.mesh.position.copy(path.curve.getPoint(progress));
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
        c.mesh.position.copy(path.curve.getPoint(progress));
        c.mesh.rotation.x = Math.PI / 2;
        c.mesh.rotation.y = tRaw * 4 + idx;
        (c.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          1.4 + 0.4 * Math.sin(t * 2.5 + idx);
      });
    });
    u.goldGlow.intensity = 0.4 + 0.25 * Math.sin(t * 1.5);

    u.movingCars.forEach((c, idx) => {
      const speed = 0.3 + idx * 0.05;
      const pos = ((tRaw * speed) + idx * 0.33) % 1;
      c.group.position.x = -3.5 + pos * 7.0;
    });

    u.starlink.rotation.y = tRaw * 0.3;

    (u.appScreen.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.5 + 0.2 * Math.sin(t * 1.6);

    root.rotation.y = Math.sin(t * 0.2) * 0.008;
  };
  return root;
}

interface TeslaCampusRuntime {
  factoryArms: {
    shoulder: THREE.Group;
    seg1: THREE.Group;
    seg2: THREE.Group;
    led: THREE.Mesh;
  }[];
  appScreen: THREE.Mesh;
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
  movingCars: { group: THREE.Group; axis: string; baseX: number; z: number }[];
  starlink: THREE.Group;
}
`;

body = body.replace(
  /const mat = \(color, o = \{\}\) =>/,
  'const mat = (color: string, o: MatOpts = {}) =>',
);
body = body.replace(/getContext\('2d'\);/g, "getContext('2d')!");
body = body.replace(
  /const movingCars = \[\];/,
  'const movingCars: { group: THREE.Group; axis: string; baseX: number; z: number }[] = [];',
);
body = body.replace(
  /const robotArms = \[\];/,
  'const robotArms: ReturnType<typeof createRobotArm>[] = [];',
);

const outPath = new URL('../src/scene/teslaCampus.ts', import.meta.url);
fs.writeFileSync(outPath, header + body + footer);
console.log('written ->', outPath.pathname);
