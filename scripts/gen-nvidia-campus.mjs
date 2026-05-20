import fs from 'fs';

const html = fs.readFileSync('public/nvidia-value-chain-diorama.html', 'utf8');
const m = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!m) throw new Error('no script');
let s = m[1];
s = s.replace(/^[\s\S]*?import \{ OrbitControls \}[^\n]*\n\s*/, '');
const paletteIdx = s.indexOf('// ===== Palette (NVIDIA green tone)');
const lightingIdx = s.indexOf('// ===== Lighting =====');
if (paletteIdx < 0 || lightingIdx < 0) throw new Error('slice markers missing');
s = s.slice(paletteIdx, lightingIdx);
s = s.replace(/function createNvidiaCampus\(\)/, 'function buildNvidiaValueChainDiorama()');
s = s.replace(/const GROUND_XZ = 1\.25;\s*const gx = \(n\) => n \* GROUND_XZ;\s*/, '');
s = s.replace(/const mat = \(color, o = \{\}\)/, 'const mat = (color: string, o: MatOpts = {})');
s = s.replace(/function box\(g,/g, 'function box(g: THREE.Group,');
s = s.replace(/function cyl\(g,/g, 'function cyl(g: THREE.Group,');
s = s.replace(/function tree\(g,/g, 'function tree(g: THREE.Group,');
s = s.replace(/function texturedPlane\(g,/g, 'function texturedPlane(g: THREE.Group,');
s = s.replace(/function createBigGPU\(g,/g, 'function createBigGPU(g: THREE.Group,');
s = s.replace(/function createGPUPedestal\(g,/g, 'function createGPUPedestal(g: THREE.Group,');
s = s.replace(/function createSmallGPU\(g,/g, 'function createSmallGPU(g: THREE.Group,');
s = s.replace(/function createNvidiaHQ\(g,/g, 'function createNvidiaHQ(g: THREE.Group,');
s = s.replace(/function createCUDACube\(g,/g, 'function createCUDACube(g: THREE.Group,');
s = s.replace(/function createServerRack\(g,/g, 'function createServerRack(g: THREE.Group,');
s = s.replace(/function createBlackwellDisplay\(g,/g, 'function createBlackwellDisplay(g: THREE.Group,');
s = s.replace(/function createNvidiaTruck\(g,/g, 'function createNvidiaTruck(g: THREE.Group,');
s = s.replace(/function createDriveCar\(g,/g, 'function createDriveCar(g: THREE.Group,');
s = s.replace(/function createOmniverseCube\(g,/g, 'function createOmniverseCube(g: THREE.Group,');
s = s.replace(/function createAdPanel\(g,/g, 'function createAdPanel(g: THREE.Group,');
s = s.replace(/function roundRect\(ctx,/g, 'function roundRect(ctx: CanvasRenderingContext2D,');
s = s.replace(/function drawNvidiaEye\(ctx,/g, 'function drawNvidiaEye(ctx: CanvasRenderingContext2D,');
s = s.replace(/const ctx = c\.getContext\('2d'\);/g, "const ctx = c.getContext('2d')!;");
s = s.replace(
  /if \(\(floor \* 7 \+ col\) % 5 === 0\) win\.material\.emissiveIntensity = 0\.2;/,
  'if ((floor * 7 + col) % 5 === 0) (win.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;',
);
s = s.replace(
  /function box\(g: THREE\.Group, name, x, y, z, sx, sy, sz, material\)/,
  'function box(g: THREE.Group, name: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, material: THREE.Material)',
);
s = s.replace(
  /function cyl\(g: THREE\.Group, name, x, y, z, r, h, material, radial = 24\)/,
  'function cyl(g: THREE.Group, name: string, x: number, y: number, z: number, r: number, h: number, material: THREE.Material, radial = 24)',
);
s = s.replace(
  /function roundRect\(ctx: CanvasRenderingContext2D, x, y, w, h, r\)/,
  'function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number)',
);
s = s.replace(
  /function drawNvidiaEye\(ctx: CanvasRenderingContext2D, cx, cy, size, color\)/,
  'function drawNvidiaEye(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string)',
);
s = s.replace(
  /function makeFacadeTextTexture\(text, bg = '#0a0a0a', fg = '#76b900'\)/,
  "function makeFacadeTextTexture(text: string, bg = '#0a0a0a', fg = '#76b900')",
);
s = s.replace(
  /function texturedPlane\(g: THREE\.Group, tex, x, y, z, w, h, rotY = 0, emissive = 0\.4\)/,
  'function texturedPlane(g: THREE.Group, tex: THREE.Texture, x: number, y: number, z: number, w: number, h: number, rotY = 0, emissive = 0.4)',
);
s = s.replace(
  /function tree\(g: THREE\.Group, x, z, s = \.5\)/,
  'function tree(g: THREE.Group, x: number, z: number, s = 0.5)',
);
s = s.replace(
  /function createBigGPU\(g: THREE\.Group, x, y, z, scale = 1, rotY = 0\)/,
  'function createBigGPU(g: THREE.Group, x: number, y: number, z: number, scale = 1, rotY = 0)',
);
s = s.replace(
  /function createGPUPedestal\(g: THREE\.Group, x, y, z\)/,
  'function createGPUPedestal(g: THREE.Group, x: number, y: number, z: number)',
);
s = s.replace(
  /function createSmallGPU\(g: THREE\.Group, x, y, z, scale = 1, rotY = 0\)/,
  'function createSmallGPU(g: THREE.Group, x: number, y: number, z: number, scale = 1, rotY = 0)',
);
s = s.replace(
  /function createNvidiaHQ\(g: THREE\.Group, cx, cy, cz\)/,
  'function createNvidiaHQ(g: THREE.Group, cx: number, cy: number, cz: number)',
);
s = s.replace(
  /function createCUDACube\(g: THREE\.Group, cx, cy, cz\)/,
  'function createCUDACube(g: THREE.Group, cx: number, cy: number, cz: number)',
);
s = s.replace(
  /function createServerRack\(g: THREE\.Group, x, y, z\)/,
  'function createServerRack(g: THREE.Group, x: number, y: number, z: number)',
);
s = s.replace(
  /function createBlackwellDisplay\(g: THREE\.Group, x, y, z\)/,
  'function createBlackwellDisplay(g: THREE.Group, x: number, y: number, z: number)',
);
s = s.replace(
  /function createNvidiaTruck\(g: THREE\.Group, x, y, z, rotY = 0, scale = 1\)/,
  'function createNvidiaTruck(g: THREE.Group, x: number, y: number, z: number, rotY = 0, scale = 1)',
);
s = s.replace(
  /function createDriveCar\(g: THREE\.Group, x, y, z, rotY = 0, scale = 1\)/,
  'function createDriveCar(g: THREE.Group, x: number, y: number, z: number, rotY = 0, scale = 1)',
);
s = s.replace(
  /function createOmniverseCube\(g: THREE\.Group, x, y, z\)/,
  'function createOmniverseCube(g: THREE.Group, x: number, y: number, z: number)',
);
s = s.replace(
  /function createAdPanel\(g: THREE\.Group, tex, x, y, z, w, h, rotY = 0\)/,
  'function createAdPanel(g: THREE.Group, tex: THREE.Texture, x: number, y: number, z: number, w: number, h: number, rotY = 0)',
);
s = s.replace(/const racks = \[\];/, "const racks: NvidiaCampusRuntime['racks'] = [];");
s = s.replace(/const smallGPUs = \[\];/, "const smallGPUs: NvidiaCampusRuntime['smallGPUs'] = [];");
s = s.replace(/const dataPaths = \[\];/, "const dataPaths: NvidiaCampusRuntime['dataPaths'] = [];");
s = s.replace(/const splashLights = \[\];/, "const splashLights: NvidiaCampusRuntime['splashLights'] = [];");
s = s.replace(/const moneyPaths = \[\];/, "const moneyPaths: NvidiaCampusRuntime['moneyPaths'] = [];");
s = s.replace(/const hq = createNvidiaHQ\(/, 'createNvidiaHQ(');
s = s.replace(/const blackwell = createBlackwellDisplay\(/, 'createBlackwellDisplay(');
s = s.replace(/      const heroPedestalGroup = bigGPU\.group;\n/, '');

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
  wireframe?: boolean;
};

interface NvidiaCampusRuntime {
  bigGPUFans: THREE.Group[];
  smallGPUs: { group: THREE.Group; fans: THREE.Group[] }[];
  racks: { group: THREE.Group; leds: THREE.Mesh[] }[];
  dataPaths: {
    curve: THREE.CatmullRomCurve3;
    beads: { mesh: THREE.Mesh; light: THREE.PointLight; offset: number }[];
    speed: number;
  }[];
  splashLights: THREE.PointLight[];
  moneyPaths: {
    curve: THREE.CatmullRomCurve3;
    coins: { mesh: THREE.Mesh; offset: number }[];
    speed: number;
  }[];
  goldGlow: THREE.PointLight;
  cuda: { group: THREE.Group; floatCube: THREE.Group; floatGlow: THREE.PointLight };
  omni: { group: THREE.Group; cube: THREE.Group };
  driveCar: { group: THREE.Group };
}

`;

const footer = `
export function createNvidiaFab(): THREE.Group {
  const root = buildNvidiaValueChainDiorama();
  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;
    const u = root.userData as NvidiaCampusRuntime;

    u.bigGPUFans.forEach((fan, i) => {
      fan.rotation.y = tRaw * (6 + i * 0.3);
    });
    u.smallGPUs.forEach((sg) => {
      sg.fans.forEach((fan, i) => {
        fan.rotation.y = tRaw * (3 + i * 0.2);
      });
    });

    u.racks.forEach((rack, rIdx) => {
      rack.leds.forEach((led, i) => {
        const intensity = 0.6 + 0.8 * Math.max(0, Math.sin(tRaw * 2 + rIdx * 0.5 + i * 0.7));
        (led.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      });
    });

    u.dataPaths.forEach((path, pIdx) => {
      path.beads.forEach((b, idx) => {
        const progress = ((tRaw * path.speed) + b.offset) % 1;
        b.mesh.position.copy(path.curve.getPoint(progress));
        const pulse = 1.4 + 0.6 * Math.sin(t * 3 + idx);
        (b.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
        b.light.intensity = 0.18 + 0.1 * Math.sin(t * 3.5 + idx);
        if (progress > 0.92) {
          u.splashLights[pIdx].intensity = 1.6 * (progress - 0.92) / 0.08;
        }
      });
      u.splashLights[pIdx].intensity *= 0.94;
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

    u.cuda.floatCube.rotation.y = tRaw * 0.8;
    u.cuda.floatCube.rotation.x = Math.sin(tRaw * 0.6) * 0.15;
    u.cuda.floatCube.position.y = 0.85 + Math.sin(tRaw * 1.2) * 0.04;
    u.cuda.floatGlow.intensity = 0.8 + 0.4 * Math.sin(tRaw * 1.5);

    u.omni.cube.rotation.y = tRaw * 0.6;
    u.omni.cube.rotation.x = tRaw * 0.4;

    root.rotation.y = Math.sin(t * 0.2) * 0.008;
  };
  return root;
}
`;

fs.writeFileSync('src/scene/nvidiaCampus.ts', header + s + footer);
console.log('wrote src/scene/nvidiaCampus.ts');
