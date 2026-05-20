import fs from 'fs';

const html = fs.readFileSync('public/boeing-assembly-diorama.html', 'utf8');
const m = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!m) throw new Error('no script');
let s = m[1];
s = s.replace(/^[\s\S]*?import \{ OrbitControls \}[^\n]*\n\s*/, '');
const paletteIdx = s.indexOf('// ===== Palette');
const lightingIdx = s.indexOf('// ===== Lighting =====');
if (paletteIdx < 0 || lightingIdx < 0) throw new Error('slice markers missing');
s = s.slice(paletteIdx, lightingIdx);
s = s.replace(/function createBoeingDiorama\(\)/, 'function buildBoeingAssemblyDiorama()');
s = s.replace(/const GROUND_XZ = 1\.25;\s*const gx = \(n\) => n \* GROUND_XZ;\s*/, '');
s = s.replace(/const mat = \(color, o = \{\}\)/, 'const mat = (color: string, o: MatOpts = {})');
s = s.replace(/function box\(g,/g, 'function box(g: THREE.Group,');
s = s.replace(/function cyl\(g,/g, 'function cyl(g: THREE.Group,');
s = s.replace(/function tree\(g,/g, 'function tree(g: THREE.Group,');
s = s.replace(/function texturedPlane\(g,/g, 'function texturedPlane(g: THREE.Group,');
s = s.replace(/function createAirliner\(g,/g, 'function createAirliner(g: THREE.Group,');
s = s.replace(/function createPartsConveyor\(g,/g, 'function createPartsConveyor(g: THREE.Group,');
s = s.replace(/function createBoeingHangar\(g,/g, 'function createBoeingHangar(g: THREE.Group,');
s = s.replace(/function createPartsWarehouse\(g,/g, 'function createPartsWarehouse(g: THREE.Group,');
s = s.replace(/function createTowTractor\(g,/g, 'function createTowTractor(g: THREE.Group,');
s = s.replace(/function createWorker\(g,/g, 'function createWorker(g: THREE.Group,');
s = s.replace(/function roundRect\(ctx,/g, 'function roundRect(ctx: CanvasRenderingContext2D,');
s = s.replace(/options = \{\}/, 'options: AirlinerOptions = {}');
s = s.replace(/const ctx = c\.getContext\('2d'\);/g, "const ctx = c.getContext('2d')!;");

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

interface AirlinerOptions {
  bodyColor?: string;
  accentColor?: string;
  bodyLen?: number;
  bodyRadius?: number;
  wingSpan?: number;
  wingChord?: number;
  engines?: boolean;
  windowCount?: number;
}

interface ConveyorPart {
  group: THREE.Group;
  offset: number;
  type: string;
  length: number;
}

interface PartsConveyor {
  group: THREE.Group;
  parts: ConveyorPart[];
  length: number;
  ledL: THREE.Mesh;
  ledR: THREE.Mesh;
}

interface BoeingAssemblyRuntime {
  conveyor1: PartsConveyor;
  conveyor2: PartsConveyor;
  moneyPaths: {
    curve: THREE.CatmullRomCurve3;
    coins: { mesh: THREE.Mesh; offset: number }[];
    speed: number;
  }[];
  goldGlow: THREE.PointLight;
}

`;

const footer = `
export function createBoeing(): THREE.Group {
  const root = buildBoeingAssemblyDiorama();
  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;
    const u = root.userData as BoeingAssemblyRuntime;

    u.conveyor1.parts.forEach((p) => {
      const progress = ((tRaw * 0.15) + p.offset) % 1;
      const localX = -u.conveyor1.length / 2 + 0.1 + progress * (u.conveyor1.length - 0.2);
      p.group.position.x = localX;
      if (p.type === 'fuselage' || p.type === 'engine') {
        p.group.rotation.x = tRaw * 0.5;
      }
    });

    u.conveyor2.parts.forEach((p) => {
      const progress = ((tRaw * 0.12) + p.offset) % 1;
      const localX = -u.conveyor2.length / 2 + 0.1 + progress * (u.conveyor2.length - 0.2);
      p.group.position.x = localX;
      if (p.type === 'fuselage' || p.type === 'engine') {
        p.group.rotation.x = tRaw * 0.5;
      }
    });

    (u.conveyor1.ledL.material as THREE.MeshBasicMaterial).color.setHSL(0, 1, 0.4 + 0.2 * Math.sin(tRaw * 4));
    (u.conveyor1.ledR.material as THREE.MeshBasicMaterial).color.setHSL(0.33, 1, 0.4 + 0.2 * Math.sin(tRaw * 3));
    (u.conveyor2.ledL.material as THREE.MeshBasicMaterial).color.setHSL(0, 1, 0.4 + 0.2 * Math.sin(tRaw * 4 + 1));
    (u.conveyor2.ledR.material as THREE.MeshBasicMaterial).color.setHSL(0.33, 1, 0.4 + 0.2 * Math.sin(tRaw * 3 + 1));

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
    u.goldGlow.intensity = 0.35 + 0.2 * Math.sin(t * 1.5);

    root.rotation.y = Math.sin(t * 0.2) * 0.008;
  };
  return root;
}
`;

fs.writeFileSync('src/scene/boeingAssembly.ts', header + s + footer);
console.log('wrote src/scene/boeingAssembly.ts');
