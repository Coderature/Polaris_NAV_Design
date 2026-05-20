import * as THREE from 'three';

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

// ===== Palette (NVIDIA green tone) =====
    const C = {
      nvGreen: '#76b900', nvGreenBright: '#a3e635', nvGreenDark: '#3d6800', nvGreenGlow: '#5a8c00',
      black: '#0a0a0a', deepBlack: '#040404', darkGrey: '#1a1a1d', greyA: '#2a2a30',
      metalDark: '#3a3a40', metal: '#7a7a80', silver: '#c8c8cc',
      glass: '#5a8a40', glassDeep: '#3a6a30',
      road: '#1c1f2a', roadLight: '#2a2d35', base: '#040508', platform: '#0e0f15',
      warm: '#fff2c8',
      pcb: '#0d0d0d', cyan: '#00e0ff', cyanDim: '#0099bb', cyanBright: '#7fffff',
      gold: '#ffd700', goldGlow: '#ffaa00',
      cudaBg: '#0a1f00',
      red: '#ff3a3a'
    };

    const mat = (color: string, o: MatOpts = {}) => new THREE.MeshStandardMaterial({
      color,
      roughness: o.roughness ?? 0.6,
      metalness: o.metalness ?? 0.08,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      emissive: o.emissive ?? '#000000',
      emissiveIntensity: o.emissiveIntensity ?? 0,
      side: o.side ?? THREE.FrontSide
    });

    const M = {
      nvGreen: mat(C.nvGreen, { emissive: C.nvGreen, emissiveIntensity: 1.0, roughness: .35, metalness: .2 }),
      nvGreenBright: mat(C.nvGreenBright, { emissive: C.nvGreenBright, emissiveIntensity: 1.6, roughness: .25 }),
      nvGreenSoft: mat(C.nvGreen, { emissive: C.nvGreenGlow, emissiveIntensity: 0.4, roughness: .4 }),
      black: mat(C.black, { roughness: .5, metalness: .25 }),
      deepBlack: mat(C.deepBlack, { roughness: .4, metalness: .35 }),
      darkGrey: mat(C.darkGrey, { roughness: .45, metalness: .3 }),
      greyA: mat(C.greyA, { roughness: .5, metalness: .3 }),
      metalDark: mat(C.metalDark, { roughness: .35, metalness: .7 }),
      metal: mat(C.metal, { roughness: .35, metalness: .55 }),
      silver: mat(C.silver, { roughness: .32, metalness: .55 }),
      white: mat('#f4f4f4', { roughness: .4 }),
      glass: mat(C.glass, { roughness: .1, metalness: .15, transparent: true, opacity: .45, emissive: C.nvGreenDark, emissiveIntensity: .25 }),
      glassDeep: mat(C.glassDeep, { roughness: .12, metalness: .15, transparent: true, opacity: .6 }),
      pcb: mat(C.pcb, { roughness: .35, metalness: .4 }),
      road: mat(C.road, { roughness: .82 }),
      roadLight: mat(C.roadLight, { roughness: .78 }),
      base: mat(C.base, { roughness: .55 }),
      platform: mat(C.platform, { roughness: .78 }),
      warmWindow: mat(C.warm, { roughness: .35, emissive: '#ffb93d', emissiveIntensity: .7 }),
      green: mat('#2f7d42', { roughness: .8 }),
      bark: mat('#7a4b2a', { roughness: .85 }),
      cyan: mat(C.cyan, { emissive: C.cyan, emissiveIntensity: 1.5, roughness: .25 }),
      cyanDim: mat(C.cyanDim, { emissive: C.cyan, emissiveIntensity: 0.5, roughness: .35 }),
      cudaBg: mat(C.cudaBg, { roughness: .3, emissive: C.nvGreenGlow, emissiveIntensity: 0.3 }),
      goldCoin: new THREE.MeshStandardMaterial({
        color: '#ffd700', emissive: '#ffaa00', emissiveIntensity: 1.6,
        roughness: .25, metalness: .85
      })
    };

    // ===== Helpers =====
    function box(g: THREE.Group, name: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, material: THREE.Material) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.castShadow = true; mesh.receiveShadow = true;
      g.add(mesh);
      return mesh;
    }
    function cyl(g: THREE.Group, name: string, x: number, y: number, z: number, r: number, h: number, material: THREE.Material, radial = 24) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radial), material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.castShadow = true; mesh.receiveShadow = true;
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

    // ===== NVIDIA logo (눈동자 + 텍스트) =====
    function drawNvidiaEye(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
      ctx.save();
      ctx.fillStyle = color;
      const s = size;
      // NVIDIA 시그니처 눈동자 모양 (아몬드형)
      ctx.beginPath();
      // 위 곡선
      ctx.moveTo(cx - s * 0.55, cy);
      ctx.quadraticCurveTo(cx - s * 0.4, cy - s * 0.45, cx + s * 0.55, cy);
      ctx.quadraticCurveTo(cx + s * 0.4, cy + s * 0.45, cx - s * 0.55, cy);
      ctx.fill();
      // 안쪽 (검정)
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.45, cy);
      ctx.quadraticCurveTo(cx - s * 0.3, cy - s * 0.32, cx + s * 0.42, cy + s * 0.03);
      ctx.quadraticCurveTo(cx - s * 0.1, cy + s * 0.25, cx - s * 0.45, cy);
      ctx.fill();
      // 중앙 작은 highlight
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx + s * 0.08, cy - s * 0.05, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function makeNvidiaLogoTexture(bg = '#0a0a0a', fg = '#76b900', withText = true) {
      const c = document.createElement('canvas');
      c.width = withText ? 1024 : 512;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, c.width, c.height);
      if (withText) {
        drawNvidiaEye(ctx, 130, c.height/2, 180, fg);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 120px "Helvetica Neue", Arial';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.letterSpacing = '4px';
        ctx.fillText('NVIDIA', 260, c.height/2);
      } else {
        drawNvidiaEye(ctx, c.width/2, c.height/2, 240, fg);
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    function makeFacadeTextTexture(text: string, bg = '#0a0a0a', fg = '#76b900') {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 128;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = fg;
      ctx.font = 'bold 72px "Helvetica Neue", Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.letterSpacing = '6px';
      ctx.fillText(text, c.width/2, c.height/2);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    // ===== CUDA Ecosystem 면 텍스처 =====
    function makeCUDATexture() {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 768;
      const ctx = c.getContext('2d')!;
      // 어두운 녹색 배경
      const grad = ctx.createLinearGradient(0, 0, 0, c.height);
      grad.addColorStop(0, '#1a3000');
      grad.addColorStop(1, '#0a1f00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);
      // 외곽 발광 (녹색 글로우)
      ctx.strokeStyle = '#76b900';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, c.width - 40, c.height - 40);
      // 상단 라벨
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px "Helvetica Neue", Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('NVIDIA CUDA ECOSYSTEM', c.width/2, 80);
      // 프레임워크 그리드 (3x2)
      const frameworks = [
        { name: 'PyTorch', color: '#ee4c2c' },
        { name: 'TensorFlow', color: '#ff6f00' },
        { name: 'ONNX', color: '#005c8c' },
        { name: 'cuBLAS', color: '#76b900' },
        { name: 'cuDNN', color: '#76b900' },
        { name: 'TensorRT', color: '#76b900' }
      ];
      const cellW = 280, cellH = 130;
      const startX = (c.width - cellW * 3) / 2 + 30;
      const startY = 180;
      frameworks.forEach((fw, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = startX + col * (cellW + 20);
        const y = startY + row * (cellH + 20);
        ctx.fillStyle = '#1a1a1d';
        roundRect(ctx, x, y, cellW, cellH, 18);
        ctx.fill();
        ctx.strokeStyle = fw.color;
        ctx.lineWidth = 3;
        roundRect(ctx, x, y, cellW, cellH, 18);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px "Helvetica Neue", Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(fw.name, x + cellW/2, y + cellH/2);
      });
      // 하단 큰 CUDA 텍스트
      ctx.fillStyle = '#76b900';
      ctx.font = 'bold 130px "Helvetica Neue", Arial';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '12px';
      ctx.fillText('CUDA', c.width/2, c.height - 90);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    // ===== Blackwell Architecture 광고판 =====
    function makeBlackwellTexture() {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 640;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, c.width, c.height);
      // 상단 녹색 헤더
      ctx.fillStyle = '#76b900';
      roundRect(ctx, 30, 30, c.width - 60, 80, 16);
      ctx.fill();
      ctx.fillStyle = '#0a0a0a';
      ctx.font = 'bold 42px "Helvetica Neue", Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CHIP DESIGN & ARCHITECTURE', c.width/2, 70);
      // 중앙 타이틀
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 56px "Helvetica Neue", Arial';
      ctx.textAlign = 'left';
      ctx.fillText('BLACKWELL', 70, 200);
      ctx.fillText('ARCHITECTURE', 70, 260);
      // 불릿 포인트
      ctx.fillStyle = '#a3e635';
      ctx.font = '32px "Helvetica Neue", Arial';
      ctx.fillText('> Higher Performance', 70, 360);
      ctx.fillText('> Lower Power', 70, 420);
      ctx.fillText('> AI-Optimized', 70, 480);
      // 우측 칩 일러스트 (회로 패턴)
      ctx.fillStyle = '#1a1a1d';
      roundRect(ctx, 600, 200, 360, 360, 16);
      ctx.fill();
      ctx.strokeStyle = '#76b900';
      ctx.lineWidth = 2;
      roundRect(ctx, 600, 200, 360, 360, 16);
      ctx.stroke();
      // 회로 트레이스
      ctx.strokeStyle = '#76b900';
      ctx.lineWidth = 1;
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.moveTo(610 + (i % 6) * 60, 210);
        ctx.lineTo(610 + (i % 6) * 60, 230 + (i % 4) * 90);
        ctx.lineTo(700 + ((i + 1) % 6) * 40, 230 + (i % 4) * 90);
        ctx.stroke();
      }
      // 중앙 칩 (작은 사각)
      ctx.fillStyle = '#2a2a30';
      roundRect(ctx, 700, 340, 160, 80, 8);
      ctx.fill();
      ctx.strokeStyle = '#76b900';
      ctx.lineWidth = 3;
      roundRect(ctx, 700, 340, 160, 80, 8);
      ctx.stroke();
      // 칩 핀
      ctx.fillStyle = '#d4af6a';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(720 + i * 16, 432, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(720 + i * 16, 330, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // NVIDIA 로고 (칩 안)
      ctx.fillStyle = '#76b900';
      ctx.font = 'bold 22px "Helvetica Neue", Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('nvidia', 780, 380);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    // ===== GeForce RTX 광고판 =====
    function makeGeForceTexture() {
      const c = document.createElement('canvas');
      c.width = 768; c.height = 768;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, c.width, c.height);
      // 상단 GEFORCE RTX 라벨
      ctx.fillStyle = '#76b900';
      ctx.font = 'bold 50px "Helvetica Neue", Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.letterSpacing = '4px';
      ctx.fillText('GEFORCE RTX', c.width/2, 80);
      // GPU 일러스트 (간단한 그래픽 카드 측면도)
      ctx.fillStyle = '#1a1a1d';
      roundRect(ctx, 100, 180, 568, 240, 16);
      ctx.fill();
      ctx.strokeStyle = '#76b900';
      ctx.lineWidth = 3;
      roundRect(ctx, 100, 180, 568, 240, 16);
      ctx.stroke();
      // 팬 3개
      for (let i = 0; i < 3; i++) {
        const fx = 220 + i * 180;
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.arc(fx, 300, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#76b900';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(fx, 300, 80, 0, Math.PI * 2);
        ctx.stroke();
        // 팬 블레이드
        ctx.strokeStyle = '#3a3a40';
        ctx.lineWidth = 3;
        for (let j = 0; j < 6; j++) {
          ctx.beginPath();
          const a = (j / 6) * Math.PI * 2;
          ctx.moveTo(fx + Math.cos(a) * 25, 300 + Math.sin(a) * 25);
          ctx.lineTo(fx + Math.cos(a) * 70, 300 + Math.sin(a) * 70);
          ctx.stroke();
        }
        // 중앙 허브
        ctx.fillStyle = '#76b900';
        ctx.beginPath();
        ctx.arc(fx, 300, 14, 0, Math.PI * 2);
        ctx.fill();
      }
      // 하단 슬로건
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Helvetica Neue", Arial';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0px';
      ctx.fillText('The Ultimate Platform', c.width/2, 510);
      ctx.fillText('for Gamers & Creators', c.width/2, 560);
      // 추가 정보
      ctx.fillStyle = '#a3e635';
      ctx.font = '28px "Helvetica Neue", Arial';
      ctx.fillText('RTX 50 SERIES', c.width/2, 640);
      ctx.fillStyle = '#888';
      ctx.font = '22px "Helvetica Neue", Arial';
      ctx.fillText('Ray Tracing · DLSS · AI Acceleration', c.width/2, 690);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    // ===== Partner Manufacturing 광고판 =====
    function makePartnerTexture() {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 384;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, c.width, c.height);
      // 상단 라벨
      ctx.fillStyle = '#76b900';
      ctx.font = 'bold 36px "Helvetica Neue", Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.letterSpacing = '3px';
      ctx.fillText('PARTNER MANUFACTURING', c.width/2, 60);
      // 3개 로고 패치
      const partners = [
        { name: 'tsmc', color: '#cc0000', bg: '#ffffff' },
        { name: 'SAMSUNG', color: '#ffffff', bg: '#1428a0' },
        { name: 'FOXCONN', color: '#0066cc', bg: '#ffffff' }
      ];
      const cellW = 280, cellH = 200;
      const startX = (c.width - cellW * 3) / 2 + 30;
      const startY = 130;
      partners.forEach((p, i) => {
        const x = startX + i * (cellW + 30);
        const y = startY;
        // 배경
        ctx.fillStyle = p.bg;
        roundRect(ctx, x, y, cellW, cellH, 16);
        ctx.fill();
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, cellW, cellH, 16);
        ctx.stroke();
        // 로고 텍스트
        ctx.fillStyle = p.color;
        ctx.font = `bold ${p.name === 'tsmc' ? 90 : 50}px "Helvetica Neue", Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.letterSpacing = '2px';
        ctx.fillText(p.name, x + cellW/2, y + cellH/2);
      });
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    // ===== Mission 광고판 ('We Design the Computer Platform...') =====
    function makeMissionTexture() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 768;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, c.width, c.height);
      drawNvidiaEye(ctx, c.width/2, 150, 200, '#76b900');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Helvetica Neue", Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.letterSpacing = '4px';
      ctx.fillText('NVIDIA', c.width/2, 300);
      // 본문
      ctx.fillStyle = '#a3e635';
      ctx.font = '28px "Helvetica Neue", Arial';
      ctx.letterSpacing = '0px';
      const lines = [
        'We Design the',
        'Computer Platform',
        "for the World's",
        'AI Era.'
      ];
      lines.forEach((line, i) => {
        ctx.fillText(line, c.width/2, 420 + i * 50);
      });
      // 하단 강조 라인
      ctx.strokeStyle = '#76b900';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(150, 660);
      ctx.lineTo(c.width - 150, 660);
      ctx.stroke();
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    // ===== 'NVIDIA Does Not Manufacture Chips' 설명 패치 =====
    function makeDoesNotMfgTexture() {
      const c = document.createElement('canvas');
      c.width = 768; c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#0a0a0a';
      roundRect(ctx, 6, 6, c.width - 12, c.height - 12, 24);
      ctx.fill();
      ctx.strokeStyle = '#76b900';
      ctx.lineWidth = 3;
      roundRect(ctx, 6, 6, c.width - 12, c.height - 12, 24);
      ctx.stroke();
      ctx.fillStyle = '#76b900';
      ctx.font = 'bold 32px "Helvetica Neue", Arial';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.letterSpacing = '2px';
      ctx.fillText('NVIDIA DOES NOT MANUFACTURE CHIPS', 50, 60);
      // 공장 X 아이콘 (간단한 박스)
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(150, 170, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#a3e635';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏭', 150, 178);
      // 본문
      ctx.fillStyle = '#ffffff';
      ctx.font = '26px "Helvetica Neue", Arial';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.letterSpacing = '0px';
      ctx.fillText('We design chips.', 230, 150);
      ctx.fillText('Our partners manufacture.', 230, 190);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    function texturedPlane(g: THREE.Group, tex: THREE.Texture, x: number, y: number, z: number, w: number, h: number, rotY = 0, emissive = 0.4) {
      const m = new THREE.MeshStandardMaterial({
        map: tex, side: THREE.DoubleSide, roughness: .4,
        emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: emissive
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      mesh.position.set(x, y, z);
      mesh.rotation.y = rotY;
      g.add(mesh);
      return mesh;
    }

    // ===== Tree =====
    function tree(g: THREE.Group, x: number, z: number, s = 0.5) {
      cyl(g, 'tree trunk', x, .23 * s / .5, z, .035, .38 * s / .5, M.bark, 10);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(.18 * s / .5, 16, 12), M.green);
      crown.position.set(x, .52 * s / .5, z);
      crown.castShadow = true; crown.receiveShadow = true;
      g.add(crown);
    }

    // ============================================================
    // ===== HERO: 큰 그래픽 카드 (RTX 5090 스타일) =====
    // ============================================================
    function createBigGPU(g: THREE.Group, x: number, y: number, z: number, scale = 1, rotY = 0) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      grp.rotation.y = rotY;
      grp.scale.setScalar(scale);
      g.add(grp);

      const W = 1.1, H = 0.16, D = 0.5;

      // 백플레이트 (메탈)
      box(grp, 'gpu back', 0, -0.04, 0, W, 0.025, D, M.metalDark);
      // PCB
      box(grp, 'gpu pcb', 0, -0.018, 0, W * 0.96, 0.018, D * 0.92, M.pcb);
      // VRAM 칩 (PCB 위 작은 박스들)
      for (let i = 0; i < 6; i++) {
        box(grp, `gpu vram ${i}`, -0.4 + i * 0.15, -0.005, 0.18, 0.07, 0.012, 0.07, M.darkGrey);
        box(grp, `gpu vram b ${i}`, -0.4 + i * 0.15, -0.005, -0.18, 0.07, 0.012, 0.07, M.darkGrey);
      }
      // GPU 다이 (중앙 큰 칩)
      box(grp, 'gpu die', 0, 0.005, 0, 0.16, 0.022, 0.16, mat('#2a2a30', { metalness: .6 }));
      box(grp, 'gpu die top', 0, 0.018, 0, 0.13, 0.005, 0.13, mat('#76b900', { emissive: '#76b900', emissiveIntensity: 0.4 }));

      // 메인 쿨러 박스 (위)
      box(grp, 'gpu cooler main', 0, 0.09, 0, W * 0.98, H, D * 0.95, M.darkGrey);
      // 쿨러 측면 메탈 띠
      box(grp, 'gpu cooler trim L', 0, 0.09, D * 0.475, W * 0.98, H, 0.008, M.metal);
      box(grp, 'gpu cooler trim R', 0, 0.09, -D * 0.475, W * 0.98, H, 0.008, M.metal);
      // 측면 큰 NVIDIA 텍스트 (좌측)
      const sideLogoTex = makeFacadeTextTexture('GeForce RTX', '#0a0a0a', '#76b900');
      texturedPlane(grp, sideLogoTex, 0, 0.09, D * 0.48, W * 0.85, 0.07, 0, 0.6);

      // ===== 측면 RGB LED 띠 (양옆) =====
      const ledMat = new THREE.MeshStandardMaterial({
        color: C.nvGreen, emissive: C.nvGreen, emissiveIntensity: 1.8, roughness: .25
      });
      box(grp, 'gpu side led L', 0, 0.005, D * 0.485, W * 0.95, 0.012, 0.005, ledMat);
      box(grp, 'gpu side led R', 0, 0.005, -D * 0.485, W * 0.95, 0.012, 0.005, ledMat);
      // 상단 LED (얇은 띠, 위)
      box(grp, 'gpu top led', 0, 0.17, 0, W * 0.85, 0.005, 0.04, ledMat);

      // 팬 3개
      const fans = [];
      for (let i = 0; i < 3; i++) {
        const fx = -W * 0.34 + i * (W * 0.34);
        // 팬 하우징 (검정 cylinder)
        cyl(grp, `fan housing ${i}`, fx, 0.165, 0, D * 0.21, 0.04, M.deepBlack, 24);
        cyl(grp, `fan ring ${i}`, fx, 0.18, 0, D * 0.22, 0.008, M.metal, 24);
        // 팬 블레이드 (회전 그룹)
        const fan = new THREE.Group();
        fan.position.set(fx, 0.185, 0);
        grp.add(fan);
        const bladeMat = mat('#1a1a1d', { metalness: .35 });
        for (let j = 0; j < 7; j++) {
          const bladeWrap = new THREE.Group();
          bladeWrap.rotation.y = (j / 7) * Math.PI * 2;
          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.13, 0.008, 0.038),
            bladeMat
          );
          blade.position.x = 0.08;
          blade.rotation.z = Math.PI / 10; // 살짝 기울임 (블레이드 곡선)
          bladeWrap.add(blade);
          fan.add(bladeWrap);
        }
        // 팬 허브
        cyl(fan, 'fan hub', 0, 0.005, 0, 0.04, 0.015, M.darkGrey, 16);
        // 팬 중앙 NVIDIA 로고 (작은 plane)
        const hubLogoTex = makeNvidiaLogoTexture('#0a0a0a', '#76b900', false);
        const hubLogo = new THREE.Mesh(
          new THREE.CircleGeometry(0.035, 24),
          new THREE.MeshStandardMaterial({
            map: hubLogoTex, emissive: '#76b900', emissiveMap: hubLogoTex, emissiveIntensity: 0.6
          })
        );
        hubLogo.position.set(0, 0.014, 0);
        hubLogo.rotation.x = -Math.PI / 2;
        fan.add(hubLogo);
        fans.push(fan);
      }

      // 출력 단자 (뒤쪽 좌측)
      box(grp, 'port plate', -W * 0.45, 0.06, 0, 0.04, 0.12, D * 0.95, M.metalDark);
      for (let i = 0; i < 4; i++) {
        box(grp, `port ${i}`, -W * 0.45 - 0.013, 0.04 + i * 0.025, 0, 0.012, 0.018, 0.045, mat('#2a2a30'));
      }
      // 전원 커넥터 (위, 우측)
      box(grp, 'pwr conn', W * 0.4, 0.18, -D * 0.4, 0.08, 0.04, 0.07, M.metalDark);
      cyl(grp, 'pwr cable', W * 0.4, 0.22, -D * 0.4, 0.025, 0.05, mat('#0a0a0a'), 12);

      // PCIe 슬롯 단자 (아래 가장자리)
      box(grp, 'pcie slot', 0, -0.05, 0, W * 0.7, 0.018, 0.022, mat('#d4af6a', { metalness: .85, roughness: .2 }));
      // 슬롯 분할
      for (let i = 0; i < 25; i++) {
        const sx = -W * 0.34 + i * (W * 0.68 / 25);
        box(grp, `slot ${i}`, sx, -0.05, 0.012, 0.004, 0.018, 0.005, mat('#2a2a30'));
      }

      return { group: grp, fans };
    }

    // ===== 받침대 (큰 GPU 디스플레이용) =====
    function createGPUPedestal(g: THREE.Group, x: number, y: number, z: number) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      g.add(grp);
      // 하단 받침
      box(grp, 'ped base', 0, 0.04, 0, 1.4, 0.08, 0.8, M.greyA);
      // 중간 단
      box(grp, 'ped mid', 0, 0.12, 0, 1.3, 0.06, 0.72, M.darkGrey);
      // 상단 (GPU가 올라갈 면)
      box(grp, 'ped top', 0, 0.17, 0, 1.25, 0.04, 0.68, mat('#0d0d0d', { metalness: .5, roughness: .3 }));
      // 외곽 녹색 LED 띠
      box(grp, 'ped led F', 0, 0.04, 0.405, 1.4, 0.012, 0.005, M.nvGreen);
      box(grp, 'ped led B', 0, 0.04, -0.405, 1.4, 0.012, 0.005, M.nvGreen);
      box(grp, 'ped led L', -0.705, 0.04, 0, 0.005, 0.012, 0.8, M.nvGreen);
      box(grp, 'ped led R', 0.705, 0.04, 0, 0.005, 0.012, 0.8, M.nvGreen);
      // 라벨
      const lbl = makeFacadeTextTexture('GeForce RTX', '#0a0a0a', '#76b900');
      texturedPlane(grp, lbl, 0, 0.085, 0.408, 0.6, 0.05, 0, 0.5);
      return grp;
    }

    // ============================================================
    // ===== Small GPU (광고판 옆 진열용 미니어처 4개) =====
    // ============================================================
    function createSmallGPU(g: THREE.Group, x: number, y: number, z: number, scale = 1, rotY = 0) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z); grp.rotation.y = rotY; grp.scale.setScalar(scale);
      g.add(grp);
      // 본체
      box(grp, 'sgpu pcb', 0, -0.012, 0, 0.32, 0.012, 0.16, M.pcb);
      box(grp, 'sgpu cooler', 0, 0.03, 0, 0.3, 0.06, 0.15, M.darkGrey);
      // 팬 2개
      const fans = [];
      for (let i = 0; i < 2; i++) {
        const fx = -0.07 + i * 0.14;
        cyl(grp, `sgpu fan ring ${i}`, fx, 0.065, 0, 0.06, 0.012, M.deepBlack, 16);
        const fan = new THREE.Group();
        fan.position.set(fx, 0.067, 0);
        grp.add(fan);
        for (let j = 0; j < 5; j++) {
          const bladeWrap = new THREE.Group();
          bladeWrap.rotation.y = (j / 5) * Math.PI * 2;
          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.005, 0.014),
            mat('#1a1a1d')
          );
          blade.position.x = 0.027;
          bladeWrap.add(blade);
          fan.add(bladeWrap);
        }
        cyl(fan, 'sgpu hub', 0, 0.004, 0, 0.012, 0.006, M.nvGreen, 12);
        fans.push(fan);
      }
      // 측면 LED
      box(grp, 'sgpu led F', 0, 0.005, 0.076, 0.3, 0.006, 0.003, M.nvGreen);
      return { group: grp, fans };
    }

    // ============================================================
    // ===== NVIDIA HQ 빌딩 =====
    // ============================================================
    function createNvidiaHQ(g: THREE.Group, cx: number, cy: number, cz: number) {
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      g.add(grp);
      const W = 1.9, H = 1.4, D = 1.3;
      // 본체
      box(grp, 'hq body', 0, H/2, 0, W, H, D, M.deepBlack);
      // 베이스
      box(grp, 'hq base', 0, 0.04, 0, W + 0.1, 0.06, D + 0.1, M.platform);
      // 옥상
      box(grp, 'hq roof', 0, H + 0.025, 0, W + 0.04, 0.05, D + 0.04, M.darkGrey);
      // ===== 옥상 HVAC 장비 (작은 박스들) =====
      box(grp, 'hq hvac 1', -0.6, H + 0.13, -0.3, 0.32, 0.16, 0.32, M.metalDark);
      box(grp, 'hq hvac 2', -0.3, H + 0.1, -0.4, 0.2, 0.1, 0.2, M.metalDark);
      box(grp, 'hq hvac 3', 0.2, H + 0.16, -0.2, 0.4, 0.22, 0.32, M.metalDark);
      box(grp, 'hq hvac 4', 0.65, H + 0.12, 0.2, 0.28, 0.14, 0.28, M.metalDark);
      // 옥상 굴뚝
      cyl(grp, 'hq stack 1', -0.65, H + 0.3, 0.0, 0.04, 0.16, M.metal, 12);
      cyl(grp, 'hq stack 2', 0.0, H + 0.32, 0.3, 0.04, 0.18, M.metal, 12);
      // 옥상 안테나
      cyl(grp, 'hq antenna', 0.7, H + 0.32, -0.4, 0.012, 0.3, M.metal, 8);
      // ===== 정면 큰 NVIDIA 로고 (검정 바탕 + 녹색 + 흰색) =====
      // 로고 영역 (검정 패치)
      box(grp, 'hq logo bg', 0, H * 0.72, D/2 + 0.005, W * 0.85, 0.4, 0.012, M.deepBlack);
      const logoTex = makeNvidiaLogoTexture('#0a0a0a', '#76b900', true);
      texturedPlane(grp, logoTex, 0, H * 0.72, D/2 + 0.013, W * 0.8, 0.34, 0, 0.55);
      // ===== 정면 글래스 부분 (하단) =====
      // 사무실 창문 격자 (4층 × 8칸)
      for (let floor = 0; floor < 4; floor++) {
        const fy = 0.18 + floor * 0.22;
        for (let col = 0; col < 7; col++) {
          const fx = -W/2 + 0.18 + col * 0.24;
          const win = box(grp, `hq win ${floor}_${col}`, fx, fy, D/2 + 0.011, 0.2, 0.16, 0.008, M.warmWindow.clone());
          // 다양한 밝기로 (불 꺼진 창문도)
          if ((floor * 7 + col) % 5 === 0) (win.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
        }
      }
      // 좌측 측면 창문 (살짝 보임)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) {
          box(grp, `hq side win ${i}_${j}`, -W/2 - 0.005, 0.18 + i * 0.22, -D/2 + 0.18 + j * 0.21, 0.01, 0.16, 0.16, M.warmWindow.clone());
        }
      }
      // 우측 측면도
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) {
          box(grp, `hq side win R ${i}_${j}`, W/2 + 0.005, 0.18 + i * 0.22, -D/2 + 0.18 + j * 0.21, 0.01, 0.16, 0.16, M.warmWindow.clone());
        }
      }
      // ===== 정면 lobby 돌출부 =====
      box(grp, 'hq lobby', 0, 0.18, D/2 + 0.14, W * 0.45, 0.36, 0.28, M.darkGrey);
      box(grp, 'hq lobby roof', 0, 0.37, D/2 + 0.14, W * 0.5, 0.04, 0.32, M.nvGreen);
      // lobby 글래스
      box(grp, 'hq lobby glass', 0, 0.2, D/2 + 0.28, W * 0.4, 0.3, 0.018, M.glass);
      // lobby 위 작은 NVIDIA 로고
      const lobbyLogoTex = makeNvidiaLogoTexture('#76b900', '#ffffff', true);
      texturedPlane(grp, lobbyLogoTex, 0, 0.41, D/2 + 0.301, W * 0.4, 0.06, 0, 0.6);
      return grp;
    }

    // ============================================================
    // ===== CUDA Ecosystem 큐브 (시그니처) =====
    // ============================================================
    function createCUDACube(g: THREE.Group, cx: number, cy: number, cz: number) {
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      g.add(grp);
      // 베이스 받침
      box(grp, 'cuda base', 0, 0.04, 0, 1.0, 0.08, 0.7, M.greyA);
      // 메인 큐브 (큰 어두운 박스)
      box(grp, 'cuda body', 0, 0.32, 0, 0.85, 0.5, 0.55, mat('#0a1f00', { roughness: .4, emissive: '#3d6800', emissiveIntensity: 0.6 }));
      // 외곽 발광 (녹색 띠)
      box(grp, 'cuda edge top', 0, 0.58, 0, 0.86, 0.012, 0.56, M.nvGreenBright);
      box(grp, 'cuda edge bot', 0, 0.07, 0, 0.86, 0.012, 0.56, M.nvGreenBright);
      box(grp, 'cuda edge F', 0, 0.32, 0.28, 0.86, 0.5, 0.005, M.nvGreenSoft);
      // 정면 CUDA 텍스처
      const cudaTex = makeCUDATexture();
      texturedPlane(grp, cudaTex, 0, 0.32, 0.283, 0.82, 0.48, 0, 0.55);
      // ===== 위에 떠 있는 작은 NVIDIA 큐브 =====
      const floatCube = new THREE.Group();
      floatCube.position.set(0, 0.85, 0);
      grp.add(floatCube);
      box(floatCube, 'float cube', 0, 0, 0, 0.18, 0.18, 0.18, mat(C.nvGreen, { emissive: C.nvGreen, emissiveIntensity: 0.6, roughness: .3 }));
      // 각 면에 작은 NVIDIA 눈
      const faceLogoTex = makeNvidiaLogoTexture('#76b900', '#0a0a0a', false);
      // 정면, 후면, 좌, 우
      [[0, 0, 0.091, 0], [0, 0, -0.091, Math.PI], [0.091, 0, 0, Math.PI/2], [-0.091, 0, 0, -Math.PI/2]].forEach(([fx, fy, fz, ry]) => {
        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(0.14, 0.14),
          new THREE.MeshStandardMaterial({
            map: faceLogoTex, transparent: true,
            emissive: '#76b900', emissiveMap: faceLogoTex, emissiveIntensity: 0.5
          })
        );
        face.position.set(fx, fy, fz);
        face.rotation.y = ry;
        floatCube.add(face);
      });
      // 떠 있는 큐브 아래 글로우 라이트
      const floatGlow = new THREE.PointLight(C.nvGreenBright, 1.0, 1.5);
      floatGlow.position.set(0, 0.85, 0);
      grp.add(floatGlow);
      return { group: grp, floatCube, floatGlow };
    }

    // ============================================================
    // ===== AI Infrastructure: 서버 랙 =====
    // ============================================================
    function createServerRack(g: THREE.Group, x: number, y: number, z: number) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      g.add(grp);
      // 베이스
      box(grp, 'rack base', 0, 0.025, 0, 0.22, 0.05, 0.32, M.platform);
      // 본체
      box(grp, 'rack body', 0, 0.32, 0, 0.18, 0.55, 0.28, M.deepBlack);
      // 옥상
      box(grp, 'rack top', 0, 0.605, 0, 0.19, 0.015, 0.29, M.darkGrey);
      // 청색 LED 줄 (양옆 4줄씩)
      const leds = [];
      for (let i = 0; i < 6; i++) {
        const ly = 0.12 + i * 0.08;
        const ledF = box(grp, `rack led ${i}`, 0, ly, 0.142, 0.14, 0.012, 0.005, M.cyan);
        leds.push(ledF);
      }
      // 측면 환기 슬릿
      for (let i = 0; i < 8; i++) {
        const ly = 0.1 + i * 0.06;
        box(grp, `rack vent ${i}`, 0.091, ly, 0, 0.005, 0.025, 0.22, mat('#0a0a0a'));
        box(grp, `rack vent L ${i}`, -0.091, ly, 0, 0.005, 0.025, 0.22, mat('#0a0a0a'));
      }
      // 상단 작은 LCD
      box(grp, 'rack lcd', 0, 0.56, 0.143, 0.1, 0.05, 0.005, mat(C.cyan, { emissive: C.cyan, emissiveIntensity: 0.8 }));
      return { group: grp, leds };
    }

    // ============================================================
    // ===== Blackwell 칩 디스플레이 =====
    // ============================================================
    function createBlackwellDisplay(g: THREE.Group, x: number, y: number, z: number) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      g.add(grp);
      // 받침
      box(grp, 'bw base', 0, 0.04, 0, 1.0, 0.08, 0.7, M.greyA);
      box(grp, 'bw mid', 0, 0.12, 0, 0.95, 0.06, 0.65, M.darkGrey);
      // 칩 모형 (받침 위)
      box(grp, 'bw chip body', -0.25, 0.2, 0, 0.32, 0.06, 0.32, mat('#1a1a1d', { metalness: .7 }));
      box(grp, 'bw chip die', -0.25, 0.235, 0, 0.22, 0.02, 0.22, mat('#0d0d0d', { metalness: .6 }));
      box(grp, 'bw chip die top', -0.25, 0.247, 0, 0.16, 0.005, 0.16, M.nvGreen);
      // 칩 핀 (4면)
      for (let i = 0; i < 8; i++) {
        cyl(grp, `bw pin F ${i}`, -0.32 + i * 0.02, 0.18, 0.16, 0.005, 0.012, mat('#d4af6a'), 8);
        cyl(grp, `bw pin B ${i}`, -0.32 + i * 0.02, 0.18, -0.16, 0.005, 0.012, mat('#d4af6a'), 8);
      }
      // 광고판 (뒤쪽 큰 panel)
      const bwTex = makeBlackwellTexture();
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0, 0.62),
        new THREE.MeshStandardMaterial({
          map: bwTex, side: THREE.DoubleSide, roughness: .4,
          emissive: '#ffffff', emissiveMap: bwTex, emissiveIntensity: 0.5
        })
      );
      panel.position.set(0.25, 0.45, 0);
      panel.rotation.y = -Math.PI / 10;
      grp.add(panel);
      // 광고판 받침
      cyl(grp, 'bw panel post L', -0.12, 0.18, 0.18, 0.014, 0.2, M.metal, 8);
      cyl(grp, 'bw panel post R', 0.55, 0.18, -0.18, 0.014, 0.2, M.metal, 8);
      return grp;
    }

    // ============================================================
    // ===== NVIDIA Truck =====
    // ============================================================
    function createNvidiaTruck(g: THREE.Group, x: number, y: number, z: number, rotY = 0, scale = 1) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z); grp.rotation.y = rotY; grp.scale.setScalar(scale);
      g.add(grp);
      // 캐빈
      box(grp, 'tk cabin', -0.2, 0.09, 0, 0.18, 0.16, 0.22, M.deepBlack);
      // 캐빈 윈드실드
      box(grp, 'tk windshield', -0.13, 0.13, 0, 0.06, 0.08, 0.21, M.glassDeep);
      // 카고
      box(grp, 'tk cargo', 0.16, 0.13, 0, 0.42, 0.24, 0.24, M.deepBlack);
      // 카고 측면 NVIDIA 로고
      const truckLogoTex = makeNvidiaLogoTexture('#0a0a0a', '#76b900', true);
      texturedPlane(grp, truckLogoTex, 0.16, 0.13, 0.121, 0.38, 0.1, 0, 0.5);
      // 바퀴
      [[-0.27, -0.11], [-0.27, 0.11], [-0.05, -0.11], [-0.05, 0.11], [0.25, -0.11], [0.25, 0.11], [0.45, -0.11], [0.45, 0.11]].forEach(([bx, bz]) => {
        const w = cyl(grp, 'wheel', bx, 0.025, bz, 0.025, 0.035, M.metalDark, 12);
        w.rotation.x = Math.PI / 2;
      });
      return grp;
    }

    // ============================================================
    // ===== NVIDIA DRIVE 자율주행 차량 =====
    // ============================================================
    function createDriveCar(g: THREE.Group, x: number, y: number, z: number, rotY = 0, scale = 1) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z); grp.rotation.y = rotY; grp.scale.setScalar(scale);
      g.add(grp);
      // 본체 (스포츠 세단)
      box(grp, 'drv body', 0, 0.04, 0, 0.28, 0.06, 0.12, mat('#1a3d00', { metalness: .55, roughness: .25 }));
      box(grp, 'drv cabin', 0, 0.09, 0, 0.2, 0.05, 0.11, mat('#1a3d00', { metalness: .55 }));
      box(grp, 'drv glass', 0, 0.09, 0, 0.19, 0.045, 0.115, M.glassDeep);
      // 헤드라이트
      box(grp, 'drv hl L', -0.13, 0.05, 0.061, 0.04, 0.012, 0.005, M.nvGreenBright);
      box(grp, 'drv hl R', -0.13, 0.05, -0.061, 0.04, 0.012, 0.005, M.nvGreenBright);
      // 옥상 라이다 + 센서 (자율주행 시그니처!)
      cyl(grp, 'drv lidar', 0, 0.135, 0, 0.025, 0.025, M.metal, 16);
      cyl(grp, 'drv lidar dome', 0, 0.155, 0, 0.025, 0.02, mat(C.nvGreenBright, { emissive: C.nvGreenBright, emissiveIntensity: 1.0, transparent: true, opacity: .85 }), 16);
      // 측면 작은 센서
      box(grp, 'drv sensor L', -0.05, 0.105, 0.061, 0.025, 0.015, 0.005, M.cyan);
      box(grp, 'drv sensor R', -0.05, 0.105, -0.061, 0.025, 0.015, 0.005, M.cyan);
      // 바퀴
      [[-0.1, -0.06], [0.1, -0.06], [-0.1, 0.06], [0.1, 0.06]].forEach(([bx, bz]) => {
        const w = cyl(grp, 'wheel', bx, 0.022, bz, 0.022, 0.025, M.metalDark, 12);
        w.rotation.x = Math.PI / 2;
      });
      return { group: grp };
    }

    // ============================================================
    // ===== Omniverse 큐브 (작은 회전 큐브, 보너스) =====
    // ============================================================
    function createOmniverseCube(g: THREE.Group, x: number, y: number, z: number) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      g.add(grp);
      // 받침
      cyl(grp, 'omni base', 0, 0.04, 0, 0.12, 0.08, M.greyA, 16);
      // 큐브 (회전)
      const cube = new THREE.Group();
      cube.position.set(0, 0.18, 0);
      grp.add(cube);
      box(cube, 'omni cube', 0, 0, 0, 0.12, 0.12, 0.12, mat('#5a4ac9', { emissive: '#5a4ac9', emissiveIntensity: 0.7, roughness: .25, transparent: true, opacity: .8 }));
      // 와이어프레임 (테두리 강조)
      box(cube, 'omni edge', 0, 0, 0, 0.125, 0.125, 0.125, mat('#a3e635', { emissive: '#a3e635', emissiveIntensity: 0.5, transparent: true, opacity: .4, wireframe: true }));
      // 라벨
      const lbl = makeFacadeTextTexture('OMNIVERSE', '#0a0a0a', '#a3e635');
      texturedPlane(grp, lbl, 0, 0.32, 0, 0.32, 0.045, 0, 0.5);
      return { group: grp, cube };
    }

    // ============================================================
    // ===== 광고판 헬퍼 (큰 광고판 + 받침 기둥) =====
    // ============================================================
    function createAdPanel(g: THREE.Group, tex: THREE.Texture, x: number, y: number, z: number, w: number, h: number, rotY = 0) {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      grp.rotation.y = rotY;
      g.add(grp);
      const m = new THREE.MeshStandardMaterial({
        map: tex, side: THREE.DoubleSide, roughness: .4,
        emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.5
      });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      panel.position.set(0, 0, 0);
      grp.add(panel);
      // 받침 기둥 (양쪽)
      cyl(grp, 'ad post L', -w/2 + 0.05, -h/2 - 0.18, 0.02, 0.018, 0.36, M.metalDark, 8);
      cyl(grp, 'ad post R', w/2 - 0.05, -h/2 - 0.18, 0.02, 0.018, 0.36, M.metalDark, 8);
      // 받침 발판
      box(grp, 'ad foot L', -w/2 + 0.05, -h/2 - 0.36, 0.02, 0.1, 0.04, 0.1, M.platform);
      box(grp, 'ad foot R', w/2 - 0.05, -h/2 - 0.36, 0.02, 0.1, 0.04, 0.1, M.platform);
      return grp;
    }

    // ============================================================
    // ===== Master: NVIDIA Campus =====
    // ============================================================
    function buildNvidiaValueChainDiorama() {
      const g = new THREE.Group();
      // ===== Base / Platform =====
      box(g, 'plinth', 0, -0.13, 0, gx(6.0), .26, gx(5.4), M.base);
      box(g, 'platform', 0, .02, 0, gx(5.6), .12, gx(5.0), M.platform);
      // ===== 도로 (캠퍼스 둘러싼) =====
      // 가로 도로
      box(g, 'road h1', 0, 0.084, -1.4, gx(5.0), 0.012, gx(0.4), M.road);
      box(g, 'road h2', 0, 0.084, 0.3, gx(5.0), 0.012, gx(0.4), M.road);
      box(g, 'road h3', 0, 0.084, 1.9, gx(5.0), 0.012, gx(0.4), M.road);
      // 세로 도로
      box(g, 'road v1', -2.5, 0.084, 0.25, gx(0.4), 0.012, gx(2.8), M.road);
      box(g, 'road v2', 2.5, 0.084, 0.25, gx(0.4), 0.012, gx(2.8), M.road);
      // 차선 (도로 위 흰 점선)
      for (let i = -2; i <= 2; i++) {
        box(g, `lane ${i}`, i * 0.5, 0.087, -1.4, 0.2, 0.005, 0.018, M.white);
        box(g, `lane2 ${i}`, i * 0.5, 0.087, 0.3, 0.2, 0.005, 0.018, M.white);
        box(g, `lane3 ${i}`, i * 0.5, 0.087, 1.9, 0.2, 0.005, 0.018, M.white);
      }

      // ===== NVIDIA HQ (좌측 뒤) =====
      createNvidiaHQ(g, -1.5, 0.08, -1.0);

      // ===== Mission 광고판 (HQ 왼쪽) =====
      const missionTex = makeMissionTexture();
      createAdPanel(g, missionTex, -3.0, 0.7, -0.5, 0.45, 0.7, Math.PI / 6);

      // ===== Blackwell 칩 디스플레이 (우측 뒤) =====
      createBlackwellDisplay(g, 1.95, 0.08, -1.6);

      // ===== CUDA Ecosystem 큐브 (중앙) =====
      const cuda = createCUDACube(g, 0, 0.08, 0.7);

      // ===== AI Infrastructure 서버 랙 6대 (우측 중간) =====
      const racks: NvidiaCampusRuntime['racks'] = [];
      for (let i = 0; i < 6; i++) {
        const rack = createServerRack(g, 2.5 - (i % 3) * 0.25, 0.08, -0.5 + Math.floor(i / 3) * 0.4);
        racks.push(rack);
      }
      // AI INFRASTRUCTURE 라벨 (서버 랙 위)
      const aiLbl = makeFacadeTextTexture('AI INFRASTRUCTURE', '#0a0a0a', '#a3e635');
      texturedPlane(g, aiLbl, 2.35, 0.95, -0.5, 0.7, 0.08, 0, 0.6);

      // ===== HERO: 큰 GPU (Pedestal 위, 중앙 앞) =====
      createGPUPedestal(g, -1.0, 0.08, 1.4);
      const bigGPU = createBigGPU(g, -1.0, 0.27, 1.4, 1.0, 0.0);
      // 측면 강조 라이트
      const heroLight = new THREE.PointLight('#a3e635', 1.5, 2.5);
      heroLight.position.set(-1.0, 0.6, 1.4);
      g.add(heroLight);

      // ===== GeForce RTX 광고판 + 작은 GPU 4개 (좌측 앞) =====
      const geforceTex = makeGeForceTexture();
      createAdPanel(g, geforceTex, -3.0, 0.6, 1.4, 0.7, 0.7, Math.PI / 6);
      // 작은 GPU 4개 진열 (광고판 아래)
      const smallGPUs: NvidiaCampusRuntime['smallGPUs'] = [];
      for (let i = 0; i < 4; i++) {
        const col = i % 2, row = Math.floor(i / 2);
        const sg = createSmallGPU(g, -2.95 + col * 0.45, 0.135, 1.95 + row * 0.4, 1.0, Math.PI / 8 * (i % 2 === 0 ? 1 : -1));
        smallGPUs.push(sg);
        // 진열대
        box(g, `display ${i}`, -2.95 + col * 0.45, 0.105, 1.95 + row * 0.4, 0.35, 0.04, 0.2, M.greyA);
      }

      // ===== NVIDIA Drive 자율주행 차량 (앞쪽 도로) =====
      const driveCar = createDriveCar(g, 0.5, 0.105, 1.5, Math.PI / 8, 1.2);
      // DRIVE 라벨
      const driveLbl = makeFacadeTextTexture('NVIDIA DRIVE', '#0a0a0a', '#76b900');
      texturedPlane(g, driveLbl, 0.5, 0.6, 1.65, 0.42, 0.05, 0, 0.5);
      cyl(g, 'drive label post', 0.5, 0.35, 1.65, 0.012, 0.5, M.metal, 8);

      // ===== Omniverse 큐브 (중앙 옆) =====
      const omni = createOmniverseCube(g, 1.4, 0.08, 0.9);

      // ===== Partner Manufacturing 광고판 (우측 앞) =====
      const partnerTex = makePartnerTexture();
      createAdPanel(g, partnerTex, 1.8, 0.65, 1.6, 0.95, 0.36, -Math.PI / 10);

      // ===== "Does Not Manufacture Chips" 패치 (중앙 앞) =====
      const dnmTex = makeDoesNotMfgTexture();
      createAdPanel(g, dnmTex, -0.05, 0.5, 1.85, 0.65, 0.22, 0);

      // ===== NVIDIA Truck (우측 끝) =====
      createNvidiaTruck(g, 2.8, 0.105, 1.0, -Math.PI / 2, 1.0);

      // ===== 외곽 나무 =====
      const treeSpots = [
        [-3.3, -2.4], [-3.3, -1.7], [-3.3, 0.0], [-3.3, 2.5],
        [3.3, -2.4], [3.3, 2.5], [3.3, -1.7],
        [-1.0, -2.5], [1.0, -2.5], [0, -2.4],
        [-2.2, 2.5], [0.8, 2.6]
      ];
      treeSpots.forEach(([x, z]) => tree(g, x, z, 0.4));
      // HQ 옆 나무
      tree(g, -2.5, -1.55, 0.32);
      tree(g, -0.4, -1.6, 0.3);
      tree(g, 0.8, -1.55, 0.3);
      // CUDA 큐브 옆 나무
      tree(g, -0.7, 0.0, 0.28);
      tree(g, 0.7, 0.0, 0.28);

      // ===== 가로등 (도로 따라) =====
      for (let i = 0; i < 6; i++) {
        const lx = -2.5 + i * 1.0;
        cyl(g, `lamp ${i}`, lx, 0.18, -1.65, 0.018, 0.3, M.metalDark, 8);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), M.warmWindow.clone());
        lamp.position.set(lx, 0.35, -1.65);
        g.add(lamp);
      }

      // ===== 데이터 흐름 (HQ → CUDA → 각 비즈니스) =====
      const dataPaths: NvidiaCampusRuntime['dataPaths'] = [];
      const businessNodes = [
        { name: 'cuda', x: 0, y: 0.5, z: 0.7 },
        { name: 'blackwell', x: 1.95, y: 0.5, z: -1.6 },
        { name: 'serverRack', x: 2.35, y: 0.4, z: -0.5 },
        { name: 'gpuHero', x: -1.0, y: 0.4, z: 1.4 },
        { name: 'drive', x: 0.5, y: 0.2, z: 1.5 }
      ];
      const splashLights: NvidiaCampusRuntime['splashLights'] = [];
      businessNodes.forEach((node, idx) => {
        const start = new THREE.Vector3(-1.5, 1.3, -1.0); // HQ 옥상
        const mid = new THREE.Vector3((start.x + node.x)/2, 1.8, (start.z + node.z)/2);
        const end = new THREE.Vector3(node.x, node.y, node.z);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const beads = [];
        const beadMat = new THREE.MeshStandardMaterial({
          color: C.nvGreenBright, emissive: C.nvGreenBright, emissiveIntensity: 2.0, roughness: .25
        });
        for (let i = 0; i < 5; i++) {
          const b = new THREE.Mesh(new THREE.SphereGeometry(.055, 14, 10), beadMat);
          const bLight = new THREE.PointLight(C.nvGreenBright, 0.18, 0.6);
          b.add(bLight);
          g.add(b);
          beads.push({ mesh: b, light: bLight, offset: i / 5 });
        }
        const splash = new THREE.PointLight(C.nvGreenBright, 0, 1.4);
        splash.position.set(node.x, node.y + 0.1, node.z);
        g.add(splash);
        splashLights.push(splash);
        dataPaths.push({ curve, beads, speed: 0.06 + idx * 0.008 });
      });

      // ===== 매출 흐름 (각 비즈니스 → HQ 옥상, 금색 코인) =====
      const moneyPaths: NvidiaCampusRuntime['moneyPaths'] = [];
      businessNodes.forEach((node, idx) => {
        const start = new THREE.Vector3(node.x, node.y + 0.3, node.z);
        const mid = new THREE.Vector3((node.x - 1.5)/2, 2.0, (node.z - 1.0)/2);
        const end = new THREE.Vector3(-1.5, 1.6, -1.0);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const coins = [];
        for (let i = 0; i < 3; i++) {
          const coin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.014, 16),
            M.goldCoin.clone()
          );
          g.add(coin);
          coins.push({ mesh: coin, offset: i / 3 });
        }
        moneyPaths.push({ curve, coins, speed: 0.05 + idx * 0.004 });
      });

      const goldGlow = new THREE.PointLight('#ffd700', 0.5, 2.5);
      goldGlow.position.set(-1.5, 1.6, -1.0);
      g.add(goldGlow);

      // ===== 조명 =====
      const greenAmbient = new THREE.PointLight('#76b900', 0.5, 4.5);
      greenAmbient.position.set(0, 1.0, 0.7);
      g.add(greenAmbient);
      const hqGlow = new THREE.PointLight('#fff2c8', 0.7, 3.5);
      hqGlow.position.set(-1.5, 0.8, -0.4);
      g.add(hqGlow);

      g.userData = {
        bigGPUFans: bigGPU.fans,
        smallGPUs,
        racks, dataPaths, splashLights, moneyPaths, goldGlow,
        cuda, omni, driveCar
      };
      return g;
    }

    
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
