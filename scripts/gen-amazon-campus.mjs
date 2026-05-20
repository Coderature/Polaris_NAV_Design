import fs from 'fs';

const html = fs.readFileSync('public/amazon-business-model-diorama.html', 'utf8');
const m = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!m) throw new Error('no script');
let s = m[1];
s = s.replace(/^[\s\S]*?import \{ OrbitControls \}[^\n]*\n\s*/, '');

const paletteIdx = s.indexOf('// ===== Palette (Amazon tone)');
let lightingIdx = s.indexOf('// ===== Scene Lighting');
if (lightingIdx < 0) lightingIdx = s.indexOf('// ===== Lighting =====');
if (paletteIdx < 0 || lightingIdx < 0) throw new Error('slice markers missing');
s = s.slice(paletteIdx, lightingIdx).trim();
s = s.replace(/function createAmazonCampus\(\)/, 'function buildAmazonCampusDiorama()');

const header = `import * as THREE from 'three';

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

type RobotArmRuntime = {
  group: THREE.Group;
  shoulder: THREE.Group;
  seg1: THREE.Group;
  seg2: THREE.Group;
  led: THREE.Mesh;
};

interface AmazonCampusRuntime {
  marketplaceArm: RobotArmRuntime;
  echoDevice: { group: THREE.Group; ledRing: THREE.Mesh };
  cargoPlane: THREE.Group;
  movingTrucks: { group: THREE.Group; baseX: number }[];
}

`;

const footer = `
export function createAmazon(): THREE.Group {
  const root = buildAmazonCampusDiorama();
  const SPEED = 0.4;
  root.userData.tick = (time: number) => {
    const t = time * SPEED;
    const tRaw = time;
    const u = root.userData as AmazonCampusRuntime;

    if (u.marketplaceArm) {
      u.marketplaceArm.shoulder.rotation.y = Math.sin(tRaw * 0.7) * 0.4;
      u.marketplaceArm.seg1.rotation.z = -Math.PI / 4 + Math.sin(tRaw * 1.0) * 0.25;
      u.marketplaceArm.seg2.rotation.z = -Math.PI / 5 + Math.cos(tRaw * 0.9) * 0.3;
      (u.marketplaceArm.led.material as THREE.MeshBasicMaterial).color.setHSL(
        0.55, 1, 0.5 + 0.3 * Math.sin(tRaw * 4),
      );
    }

    if (u.echoDevice?.ledRing) {
      (u.echoDevice.ledRing.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + 0.5 * Math.sin(tRaw * 2);
    }

    if (u.cargoPlane) {
      u.cargoPlane.position.x = 3.8 + Math.sin(tRaw * 0.2) * 0.3;
      u.cargoPlane.position.z = -2.3 + Math.cos(tRaw * 0.2) * 0.15;
      u.cargoPlane.position.y = 0.9 + Math.sin(tRaw * 0.4) * 0.05;
    }

    u.movingTrucks.forEach((tr, idx) => {
      const speed = 0.25 + idx * 0.05;
      const pos = ((tRaw * speed) + idx * 0.33) % 1;
      tr.group.position.x = -3.8 + pos * 7.6;
    });

    root.rotation.y = Math.sin(t * 0.15) * 0.008;
  };
  return root;
}

export function createAmazonWarehouse(): THREE.Group {
  return createAmazon();
}
`;

let body = s;
body = body.replace(/const mat = \(color, o = \{\}\)/, 'const mat = (color: string, o: MatOpts = {})');
body = body.replace(/const ctx = c\.getContext\('2d'\);/g, "const ctx = c.getContext('2d')!");
body = body.replace(/function box\(g,/g, 'function box(g: THREE.Group,');
body = body.replace(/function cyl\(g,/g, 'function cyl(g: THREE.Group,');
body = body.replace(/function tree\(g,/g, 'function tree(g: THREE.Group,');
body = body.replace(/function texturedPlane\(g,/g, 'function texturedPlane(g: THREE.Group,');
body = body.replace(/function rooftopPanel\(g,/g, 'function rooftopPanel(g: THREE.Group,');
body = body.replace(/function roundRect\(ctx,/g, 'function roundRect(ctx: CanvasRenderingContext2D,');
body = body.replace(/function drawAmazonSmile\(ctx,/g, 'function drawAmazonSmile(ctx: CanvasRenderingContext2D,');
body = body.replace(/function createPackageBox\(g,/g, 'function createPackageBox(g: THREE.Group,');
body = body.replace(/function createPrimeTruck\(g,/g, 'function createPrimeTruck(g: THREE.Group,');
body = body.replace(/function createCargoPlane\(g,/g, 'function createCargoPlane(g: THREE.Group,');
body = body.replace(/function createYellowRobotArm\(g,/g, 'function createYellowRobotArm(g: THREE.Group,');
body = body.replace(/function createEchoSpeaker\(g,/g, 'function createEchoSpeaker(g: THREE.Group,');
body = body.replace(/function createServerRack\(g,/g, 'function createServerRack(g: THREE.Group,');
body = body.replace(/function createAWSCloud\(g,/g, 'function createAWSCloud(g: THREE.Group,');
body = body.replace(/function createAWSIcon\(g,/g, 'function createAWSIcon(g: THREE.Group,');
body = body.replace(/function createAmazonHQ\(g,/g, 'function createAmazonHQ(g: THREE.Group,');
body = body.replace(/function createAWSSatellite\(g,/g, 'function createAWSSatellite(g: THREE.Group,');
body = body.replace(/function createFulfillment\(g,/g, 'function createFulfillment(g: THREE.Group,');
body = body.replace(/function createMarketplace\(g,/g, 'function createMarketplace(g: THREE.Group,');
body = body.replace(/function createDigitalContent\(g,/g, 'function createDigitalContent(g: THREE.Group,');
body = body.replace(/function createAdvertising\(g,/g, 'function createAdvertising(g: THREE.Group,');
body = body.replace(/function createDevicesServices\(g,/g, 'function createDevicesServices(g: THREE.Group,');
body = body.replace(/const movingTrucks = \[\];/, 'const movingTrucks: AmazonCampusRuntime["movingTrucks"] = [];');
body = body.replace(/const hq = createAmazonHQ\(/, 'createAmazonHQ(');
body = body.replace(/const aws = createAWSSatellite\(/, 'createAWSSatellite(');
body = body.replace(/const fulfillment = createFulfillment\(/, 'createFulfillment(');
body = body.replace(/const marketplace = createMarketplace\(/, 'const marketplace = createMarketplace(');
body = body.replace(/const digital = createDigitalContent\(/, 'createDigitalContent(');
body = body.replace(/const advertising = createAdvertising\(/, 'createAdvertising(');
body = body.replace(/const devices = createDevicesServices\(/, 'const devices = createDevicesServices(');
body = body.replace(
  /29 \+ Math\.floor\(Math\.random\(\) \* 70\)/g,
  '29 + ((i * 17) % 70)',
);

fs.writeFileSync('src/scene/amazonCampus.ts', header + body + footer);
console.log('wrote src/scene/amazonCampus.ts from public/amazon-business-model-diorama.html');
