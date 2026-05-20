import fs from 'fs';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
let ts = fs.readFileSync(`${root}/src/scene/samsungFab.ts`, 'utf8');

ts = ts.replace(/^\uFEFF/, '');
ts = ts.replace(/import\s*\*\s*as\s*THREE\s*from\s*['"]three['"];\s*\r?\n/, '');
ts = ts.replace(/export function createSamsungFab[\s\S]*$/m, '');
ts = ts.replace(/interface SamsungFabRuntime[\s\S]*$/m, '');
ts = ts.replace(/^type FabType[^\n]*\r?\n/m, '');
ts = ts.replace(/^type MatOpts[\s\S]*?};\r?\n\r?\n/m, '');
ts = ts.replace(/ as const/g, '');
ts = ts.replace(/ as FabType\[\]/g, '');
ts = ts.replace(/ as THREE\.MeshStandardMaterial/g, '');
ts = ts.replace(/: THREE\.\w+/g, '');
ts = ts.replace(/: ReturnType<typeof createProcessingStation>\[\]/g, '');
ts = ts.replace(/: \{ group: THREE\.Group; screen: THREE\.Mesh \}\[\]/g, '');
ts = ts.replace(/: \{ statue: THREE\.Object3D \}\[\]/g, '');
ts = ts.replace(/: \[number, number\]\[\]/g, '');
ts = ts.replace(/: \{ title: string; sub: string \}\[\]/g, '');
ts = ts.replace(/: number/g, '');
ts = ts.replace(/: string/g, '');
ts = ts.replace(/: boolean/g, '');
ts = ts.replace(/getContext\('2d'\)!/g, "getContext('2d')");
ts = ts.replace(/\(dt: number\)/g, '(dt)');

const body = ts.trim();

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Samsung Semiconductor Diorama · 005930</title>
  <style>
    html, body {
      width: 100%; height: 100%; margin: 0; overflow: hidden;
      background: #0b1018;
      font-family: "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif;
    }
    #hud {
      position: fixed; left: 20px; top: 18px; z-index: 10;
      color: #e8eef5;
      background: rgba(11, 16, 24, 0.88);
      border: 1px solid rgba(0, 229, 208, 0.45);
      border-radius: 16px; padding: 13px 16px;
      line-height: 1.55;
      box-shadow: 0 18px 40px rgba(0,0,0,.45), 0 0 24px rgba(0, 229, 208, 0.08);
      pointer-events: none;
    }
    #hud b { color: #00e5d0; font-size: 18px; letter-spacing: 0.5px; }
    #hud span { color: #b8c4d4; font-size: 13px; }
    #tip {
      position: fixed; right: 20px; top: 18px; z-index: 10;
      color: #e8eef5;
      background: rgba(20, 28, 42, 0.92);
      border: 1px solid rgba(0, 229, 208, 0.25);
      border-radius: 999px; padding: 9px 14px;
      font-size: 13px;
      box-shadow: 0 14px 30px rgba(0,0,0,.35);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="hud">
    <b>SAMSUNG SEMICONDUCTOR</b><br />
    <span>본사 · DRAM · NAND · FOUNDRY Fab 캠퍼스</span><br />
    <span>시안 LED 베이스 · 공정 컨베이어 라인 · 옥상 제품 조형</span>
  </div>
  <div id="tip">드래그 회전 · 휠 확대 · 우클릭 이동</div>

  <script type="module">
    import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
    import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1018');
    scene.fog = new THREE.Fog('#0b1018', 12, 26);

    const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(6.2, 5.4, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.55, 0.55, 0.05);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4.5;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI * 0.49;

${body.split('\n').map((l) => '    ' + l).join('\n')}

    const samsung = buildSamsungDiorama();
    samsung.scale.setScalar(1.0);
    scene.add(samsung);

    function animate() {
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
</html>
`;

const out = `${root}/public/samsung-electronics-diorama.html`;
fs.writeFileSync(out, html);
console.log('written', out);
