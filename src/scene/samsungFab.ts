import * as THREE from 'three';

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

const C = {
      blue: '#1428a0', blueDark: '#071a5f', blueLight: '#4d8dff',
      cyan: '#5fb8ff', hotCyan: '#9be3ff',
      white: '#f4f4f4', silver: '#cfd4dc', metal: '#999999', metalDark: '#5a5a64',
      glass: '#78b7ff', warm: '#fff2c8',
      road: '#242832', base: '#111827', platform: '#d7dce6',
      green: '#2f7d42', pcbGreen: '#1a5c2f',
      conveyor: '#3a3a45', conveyorBelt: '#1a1a22',
      phoneBlack: '#0a0a0e', phoneScreen: '#3aa0ff',
      dramGold: '#d4af6a',
      tvFrame: '#1a1a1a', tvScreen: '#1e3a8a',
      ssdBlack: '#181820', waferBlue: '#9ad5ff',
      gold: '#ffd700', warning: '#ffcf3a'
    };

    const mat = (color: string, o: MatOpts = {}) => new THREE.MeshStandardMaterial({
      color,
      roughness: o.roughness ?? 0.62,
      metalness: o.metalness ?? 0.05,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      emissive: o.emissive ?? '#000000',
      emissiveIntensity: o.emissiveIntensity ?? 0
    });

    const M = {
      blue: mat(C.blue, { roughness: .6, metalness: .1 }),
      blueDark: mat(C.blueDark, { roughness: .5, metalness: .12 }),
      blueLight: mat(C.blueLight, { roughness: .3, metalness: .15, emissive: '#1b5dff', emissiveIntensity: .25 }),
      white: mat(C.white, { roughness: .85 }),
      silver: mat(C.silver, { roughness: .42, metalness: .35 }),
      metal: mat(C.metal, { roughness: .4, metalness: .65 }),
      metalDark: mat(C.metalDark, { roughness: .5, metalness: .75 }),
      glass: mat(C.glass, { roughness: .1, metalness: .08, transparent: true, opacity: .42, emissive: '#0a3cff', emissiveIntensity: .12 }),
      warmWindow: mat(C.warm, { roughness: .35, emissive: '#ffb93d', emissiveIntensity: .65 }),
      road: mat(C.road, { roughness: .82 }),
      base: mat(C.base, { roughness: .55 }),
      platform: mat(C.platform, { roughness: .78 }),
      green: mat(C.green, { roughness: .8 }),
      conveyorBase: mat(C.conveyor, { roughness: .6, metalness: .4 }),
      conveyorBelt: mat(C.conveyorBelt, { roughness: .9 }),
      phoneBody: mat(C.phoneBlack, { roughness: .35, metalness: .6 }),
      phoneScreen: mat(C.phoneScreen, { roughness: .15, emissive: C.phoneScreen, emissiveIntensity: 1.2 }),
      dramPCB: mat(C.pcbGreen, { roughness: .6, metalness: .15 }),
      dramChip: mat('#1a1a1a', { roughness: .4, metalness: .5 }),
      dramGold: mat(C.dramGold, { roughness: .25, metalness: .85 }),
      tvFrame: mat(C.tvFrame, { roughness: .3, metalness: .6 }),
      tvScreen: mat(C.tvScreen, { roughness: .12, emissive: '#3a78ff', emissiveIntensity: 0.9 }),
      ssdBody: mat(C.ssdBlack, { roughness: .35, metalness: .6 }),
      wafer: mat(C.waferBlue, { roughness: .15, metalness: .4, emissive: '#1e4dcc', emissiveIntensity: .3 }),
      circuitTrace: new THREE.MeshStandardMaterial({
        color: C.cyan, emissive: C.cyan, emissiveIntensity: 1.8, roughness: .2
      }),
      scanLine: new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, opacity: .7 }),
      skyBeam: new THREE.MeshBasicMaterial({ color: '#3aa0ff', transparent: true, opacity: .35 }),
      // 변경 #6: 금색 코인 재질
      goldCoin: new THREE.MeshStandardMaterial({
        color: C.gold, emissive: '#ffaa00', emissiveIntensity: 1.6,
        roughness: .25, metalness: .85
      }),
      warningStripe: mat(C.warning, { roughness: .5, emissive: C.warning, emissiveIntensity: .35 })
    };

    function box(g, name, x, y, z, sx, sy, sz, material) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      return mesh;
    }

    function cyl(g, name, x, y, z, r, h, material, radial = 24) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radial), material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      return mesh;
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function makeSamsungLogoTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1428a0';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2, 400, 92, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 108px "Arial Black", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SAMSUNG', canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    function makeFabProductTexture(fabType: FabType) {
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
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fabType, canvas.width / 2, 48);

      const products = {
        DRAM: ['DDR5 메모리', 'HBM3 (AI)', '서버 메모리'],
        NAND: ['SSD 컨트롤러', 'V-NAND', '플래시 메모리'],
        FOUNDRY: ['7나노 공정', '엑시노스', 'AI 칩 위탁생산']
      };
      const items = products[fabType] || ['제품 라인'];

      ctx.fillStyle = '#1428a0';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'left';
      items.forEach((item, i) => {
        ctx.fillText('• ' + item, 30, 130 + i * 60);
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    function fabProductBoard(g: THREE.Group, fabType: FabType, x, y, z, w, h) {
      const texture = makeFabProductTexture(fabType);
      const material = new THREE.MeshStandardMaterial({
        map: texture, side: THREE.DoubleSide,
        roughness: 0.45, emissive: '#ffffff',
        emissiveMap: texture, emissiveIntensity: 0.25
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      mesh.position.set(x, y, z);
      g.add(mesh);
      return mesh;
    }

    function makeProductLabelTexture(text) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1428a0';
      roundRect(ctx, 4, 4, canvas.width - 8, canvas.height - 8, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    function productLabel(g, text, x, y, z, w, h) {
      const texture = makeProductLabelTexture(text);
      const material = new THREE.MeshStandardMaterial({
        map: texture, side: THREE.DoubleSide,
        roughness: 0.5, emissive: '#ffffff',
        emissiveMap: texture, emissiveIntensity: 0.3
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      mesh.position.set(x, y, z);
      g.add(mesh);
      return mesh;
    }

    function samsungSign(g, x, y, z, w, h) {
      const texture = makeSamsungLogoTexture();
      const material = new THREE.MeshStandardMaterial({
        map: texture, side: THREE.DoubleSide,
        roughness: 0.45, emissive: '#ffffff',
        emissiveMap: texture, emissiveIntensity: 0.25
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      g.add(mesh);
      return mesh;
    }

    // ===== 변경 #8: 하만 카돈 텍스처 =====
    function makeHarmanLabelTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#d4af6a';
      ctx.lineWidth = 3;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
      ctx.fillStyle = '#d4af6a';
      ctx.font = 'italic bold 52px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('harman/kardon', canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    function harmanLabel(g, x, y, z, w, h) {
      const texture = makeHarmanLabelTexture();
      const material = new THREE.MeshStandardMaterial({
        map: texture, side: THREE.DoubleSide,
        roughness: 0.4, emissive: '#ffffff',
        emissiveMap: texture, emissiveIntensity: 0.3
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      mesh.position.set(x, y, z);
      g.add(mesh);
      return mesh;
    }

    // ===== 제품 빌더 =====
    function createPhone(g, x, y, z, scale = 1) {
      const phoneGroup = new THREE.Group();
      phoneGroup.position.set(x, y, z);
      phoneGroup.scale.setScalar(scale);
      g.add(phoneGroup);
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.018), M.phoneBody);
      body.castShadow = true;
      phoneGroup.add(body);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.245), M.phoneScreen.clone());
      screen.position.set(0, 0, 0.01);
      phoneGroup.add(screen);
      const camMod = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.005), mat('#333333', { metalness: 0.7 }));
      camMod.position.set(-0.04, 0.1, -0.012);
      phoneGroup.add(camMod);
      return { group: phoneGroup, screen };
    }

    function createDRAM(g, x, y, z, scale = 1) {
      const dramGroup = new THREE.Group();
      dramGroup.position.set(x, y, z);
      dramGroup.scale.setScalar(scale);
      g.add(dramGroup);
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.015), M.dramPCB);
      pcb.castShadow = true;
      dramGroup.add(pcb);
      for (let i = 0; i < 4; i++) {
        const chipFront = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.012), M.dramChip);
        chipFront.position.set(-0.13 + i * 0.087, 0.005, 0.011);
        dramGroup.add(chipFront);
        const chipBack = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.012), M.dramChip);
        chipBack.position.set(-0.13 + i * 0.087, 0.005, -0.011);
        dramGroup.add(chipBack);
      }
      const pins = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.012, 0.012), M.dramGold);
      pins.position.set(0, -0.038, 0);
      dramGroup.add(pins);
      return dramGroup;
    }

    function createTV(g, x, y, z, scale = 1) {
      const tvGroup = new THREE.Group();
      tvGroup.position.set(x, y, z);
      tvGroup.scale.setScalar(scale);
      g.add(tvGroup);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.018), M.tvFrame);
      frame.castShadow = true;
      tvGroup.add(frame);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.17), M.tvScreen.clone());
      screen.position.set(0, 0, 0.01);
      tvGroup.add(screen);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.06), M.tvFrame);
      stand.position.set(0, -0.12, 0);
      tvGroup.add(stand);
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.08), M.tvFrame);
      base.position.set(0, -0.146, 0);
      tvGroup.add(base);
      return { group: tvGroup, screen };
    }

    function createSSD(g, x, y, z, scale = 1) {
      const ssdGroup = new THREE.Group();
      ssdGroup.position.set(x, y, z);
      ssdGroup.scale.setScalar(scale);
      g.add(ssdGroup);
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.12), M.ssdBody);
      body.castShadow = true;
      ssdGroup.add(body);
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, 0.04),
        new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.4 })
      );
      label.position.set(0, 0.014, 0);
      label.rotation.x = -Math.PI / 2;
      ssdGroup.add(label);
      return ssdGroup;
    }

    function createWaferDisc(g, x, y, z, scale = 1) {
      const waferGroup = new THREE.Group();
      waferGroup.position.set(x, y, z);
      waferGroup.scale.setScalar(scale);
      g.add(waferGroup);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.012, 32), M.wafer);
      disc.castShadow = true;
      waferGroup.add(disc);
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const die = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, 0.001, 0.025),
            mat('#0a2a6a', { emissive: '#1e4dcc', emissiveIntensity: 0.4 })
          );
          die.position.set(i * 0.04, 0.008, j * 0.04);
          waferGroup.add(die);
        }
      }
      return waferGroup;
    }

    function buildSamsungDiorama() {
      const g = new THREE.Group();

      // ===== Base / 변경 #7: front road · crosswalk 제거 =====
      box(g, 'dark cell plinth', 0, -0.13, 0, gx(4.8), .26, gx(4.3), M.base);
      box(g, 'single cell platform', 0, .02, 0, gx(4.35), .12, gx(3.85), M.platform);
      // fab road만 유지하되 HQ 이동 따라 위치 조정
      box(g, 'fab road', 0.0, .11, -1.05, gx(2.4), .04, gx(0.35), M.road);

      // ============================================================
      // ===== HQ (변경 #1: 왼쪽 뒤로 이동, 변경 #9: 간판 키우기) =====
      // ============================================================
      box(g, 'Samsung HQ main tower', HQ_X, 1.5, HQ_Z, 2.0, 3.0, 1.5, M.blue);
      box(g, 'HQ rooftop white accent', HQ_X, 3.08, HQ_Z, 2.1, .15, 1.6, M.white);
      box(g, 'HQ lower lobby', HQ_X, .32, HQ_Z + 0.84, 1.65, .48, .18, M.white);
      box(g, 'HQ entrance canopy', HQ_X, .72, HQ_Z + 1.0, .95, .12, .32, M.blueLight);

      const floorWindows = [];
      for (let floor = 0; floor < 8; floor++) {
        const y = .65 + floor * .28;
        const w = box(g, `front warm window ${floor}`, HQ_X, y, HQ_Z + 0.765, 1.64, .07, .035, M.warmWindow.clone());
        floorWindows.push({ mesh: w, floor });
      }
      for (let col = 0; col < 7; col++) {
        const x = (HQ_X - 0.8) + col * .27;
        box(g, `vertical glass mullion ${col}`, x, 1.73, HQ_Z + 0.785, .035, 2.25, .035, M.glass);
      }
      box(g, 'left blue glass wall', HQ_X - 1.02, 1.63, HQ_Z, .04, 2.45, 1.12, M.glass);
      box(g, 'right blue glass wall', HQ_X + 1.02, 1.63, HQ_Z, .04, 2.45, 1.12, M.glass);

      // Sky beam
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.12, 4.0, 12, 1, true),
        M.skyBeam
      );
      beam.position.set(HQ_X, 5.2, HQ_Z);
      beam.castShadow = false;
      g.add(beam);
      const beamBase = box(g, 'beam base emitter', HQ_X, 3.22, HQ_Z, 0.18, 0.06, 0.18, M.circuitTrace);

      // ===== Samsung 옥상 사인 (변경 #9: 1.72×0.46 → 2.5×0.7) =====
      const roofSign = samsungSign(g, HQ_X, 3.55, HQ_Z + 0.55, 2.5, 0.7);
      roofSign.rotation.x = -Math.PI / 8;
      box(g, 'roof sign post A', HQ_X - 0.78, 3.25, HQ_Z + 0.47, .06, .42, .06, M.silver);
      box(g, 'roof sign post B', HQ_X + 0.78, 3.25, HQ_Z + 0.47, .06, .42, .06, M.silver);
      // 정면 큰 사인 (1.45×0.46 → 2.2×0.65)
      samsungSign(g, HQ_X, 1.9, HQ_Z + 0.776, 2.2, 0.65);

      // 위성 디시
      cyl(g, 'satellite dish mount', HQ_X - 0.7, 3.22, HQ_Z - 0.5, .04, .25, M.metal, 12);
      const dishPivot = new THREE.Group();
      dishPivot.position.set(HQ_X - 0.7, 3.4, HQ_Z - 0.5);
      g.add(dishPivot);
      const dish = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2),
        M.silver
      );
      dish.rotation.x = Math.PI;
      dish.position.set(0, 0.05, 0);
      dishPivot.add(dish);
      cyl(dishPivot, 'dish antenna', 0, 0.15, 0, .015, .25, M.metal, 8);
      const dishLed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), new THREE.MeshBasicMaterial({ color: '#ff3355' }));
      dishLed.position.set(0, 0.3, 0);
      dishPivot.add(dishLed);

      // ============================================================
      // ===== 팹 (변경 #2 반도체 디테일, #3 크기 확대, #4 제품 확대) =====
      // ============================================================
      // 본체: 1.0×1.2×1.0 → 1.4×1.6×1.4, Z 간격 ±1.15 → ±1.5
      const fabPositions = [
        [1.35, .8, -1.5, 'DRAM'],
        [1.35, .8, 0.0, 'NAND'],
        [1.35, .8, 1.5, 'FOUNDRY']
      ];
      const fabScanLines = [];
      fabPositions.forEach(([x, y, z, label], i) => {
        // 본체
        box(g, `fab ${label}`, x, y, z, 1.4, 1.6, 1.4, M.white);
        // 옥상 트림
        box(g, `fab blue trim ${label}`, x, 1.64, z, 1.5, .08, 1.5, M.blueLight);
        // 정면 유리
        box(g, `fab front glass ${label}`, x, 0.8, z + 0.71, 1.0, 0.5, .035, M.glass);
        // 측면 큰 제품 안내판 (좌측, 크게)
        fabProductBoard(g, label, x - 0.71, 0.85, z, 0.65, 1.1);

        // ===== 변경 #2: 반도체 공장 디테일 =====
        // 옥상 대형 배기 덕트
        box(g, `fab duct ${label}`, x, 1.82, z, 0.65, 0.32, 0.65, M.silver);
        box(g, `fab duct cap ${label}`, x, 2.0, z, 0.72, 0.06, 0.72, M.metalDark);
        // 옥상 굴뚝 4개 (모서리)
        cyl(g, `fab stack ${label} A`, x - 0.55, 1.88, z - 0.55, 0.07, 0.42, M.metalDark, 16);
        cyl(g, `fab stack ${label} B`, x + 0.55, 1.88, z - 0.55, 0.07, 0.42, M.metalDark, 16);
        cyl(g, `fab stack ${label} C`, x - 0.55, 1.88, z + 0.55, 0.07, 0.42, M.metalDark, 16);
        cyl(g, `fab stack ${label} D`, x + 0.55, 1.88, z + 0.55, 0.07, 0.42, M.metalDark, 16);
        // 측면 수직 파이프 2개
        cyl(g, `fab pipe ${label} L`, x - 0.74, 0.8, z - 0.5, 0.05, 1.5, M.metal, 12);
        cyl(g, `fab pipe ${label} R`, x + 0.74, 0.8, z + 0.5, 0.05, 1.5, M.metal, 12);
        // 수평 연결 파이프 (옥상 측)
        const hPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12), M.metal);
        hPipe.position.set(x + 0.78, 1.55, z);
        hPipe.rotation.x = Math.PI / 2;
        g.add(hPipe);
        // 로딩 도크 셔터 (정면 하단)
        box(g, `fab dock ${label}`, x, 0.22, z + 0.715, 0.5, 0.4, 0.04, M.metalDark);
        // 경고 노란 줄무늬 (옥상 가장자리, 정면 측)
        box(g, `fab warning ${label}`, x, 1.605, z + 0.68, 1.4, 0.02, 0.04, M.warningStripe);

        // 스캔라인 (위치 보정)
        const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.04), M.scanLine.clone());
        scanLine.position.set(x, 1.0, z + 0.728);
        g.add(scanLine);
        fabScanLines.push({ mesh: scanLine, baseX: x, baseZ: z + 0.728, phase: i * 0.33 });
      });

      // ===== 변경 #4: 옥상 제품 확대 (scale ↑, 위치 보정) =====
      // 옥상 새 Y = 1.64 → 제품 Y ≈ 1.7
      // DRAM 팹 (z=-1.5)
      createDRAM(g, 1.0, 1.72, -1.78, 1.7);
      createDRAM(g, 1.7, 1.72, -1.78, 1.7).rotation.y = Math.PI / 8;
      createDRAM(g, 1.35, 1.72, -1.25, 1.7).rotation.y = Math.PI / 4;
      productLabel(g, 'DRAM', 1.35, 2.05, -2.15, 0.6, 0.14);

      // NAND 팹 (z=0)
      createSSD(g, 1.0, 1.74, -0.25, 1.8);
      createSSD(g, 1.7, 1.74, -0.25, 1.8).rotation.y = Math.PI / 6;
      createSSD(g, 1.35, 1.74, 0.28, 1.8).rotation.y = Math.PI / 3;
      productLabel(g, 'SSD / V-NAND', 1.35, 2.05, -0.65, 0.75, 0.14);

      // FOUNDRY 팹 (z=1.5)
      createWaferDisc(g, 1.0, 1.72, 1.25, 1.8);
      createWaferDisc(g, 1.7, 1.72, 1.78, 1.8);
      productLabel(g, 'FOUNDRY 웨이퍼', 1.35, 2.05, 0.95, 0.85, 0.14);

      // ===== 환기구 (옥상 위, 위치 업데이트) =====
      const vents = [
        [1.05, 1.92, -1.85], [1.7, 1.92, -1.2],
        [1.05, 1.92, 0.3], [1.7, 1.92, -0.05],
        [1.35, 1.92, 1.85]
      ];
      const steamBeads = [];
      vents.forEach(([x, y, z], i) => {
        cyl(g, `cleanroom vent ${i + 1}`, x, y, z, .1, .4, M.metal, 24);
        cyl(g, `cleanroom vent cap ${i + 1}`, x, y + .23, z, .12, .05, M.silver, 24);
        for (let j = 0; j < 3; j++) {
          const steam = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshBasicMaterial({
            color: '#ffffff', transparent: true, opacity: 0.5
          }));
          steam.castShadow = false;
          g.add(steam);
          steamBeads.push({
            mesh: steam, baseX: x, baseY: y + 0.3, baseZ: z,
            offset: (i * 3 + j) / (vents.length * 3),
            speed: 0.1 + (i * 3 + j) * 0.01
          });
        }
      });

      // 지면 대형 웨이퍼
      const wafer = new THREE.Mesh(
        new THREE.CylinderGeometry(.28, .28, .035, 40),
        new THREE.MeshStandardMaterial({
          color: '#9ad5ff', roughness: .18, metalness: .35, emissive: '#245dff', emissiveIntensity: .25
        })
      );
      wafer.position.set(.2, .16, 1.0);
      wafer.rotation.x = Math.PI / 2;
      wafer.castShadow = true;
      g.add(wafer);

      // ============================================================
      // ===== 변경 #5: 데이터 비드 감속 (HQ → 팹, 지시 흐름) =====
      // ============================================================
      const dataPaths = [];
      const fabSplashLights = [];
      fabPositions.forEach(([fx, fy, fz, label], idx) => {
        const start = new THREE.Vector3(HQ_X + 0.7, 1.0, HQ_Z);
        const mid = new THREE.Vector3((HQ_X + fx) / 2, 0.9, (HQ_Z + fz) / 2);
        const end = new THREE.Vector3(fx - 0.7, 0.95, fz);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const beads = [];
        const beadMat = new THREE.MeshStandardMaterial({
          color: C.hotCyan, emissive: C.hotCyan, emissiveIntensity: 2.0, roughness: .25
        });
        for (let i = 0; i < 5; i++) {
          const b = new THREE.Mesh(new THREE.SphereGeometry(.055, 16, 12), beadMat);
          b.castShadow = false;
          const beadLight = new THREE.PointLight(C.hotCyan, 0.2, 0.6);
          b.add(beadLight);
          g.add(b);
          beads.push({ mesh: b, light: beadLight, offset: i / 5 });
        }
        const splashLight = new THREE.PointLight(C.hotCyan, 0, 1.5);
        splashLight.position.set(fx - 0.7, 1.1, fz);
        g.add(splashLight);
        fabSplashLights.push(splashLight);
        // 기존 0.16~0.20 → 0.06~0.08 (60% 감속)
        dataPaths.push({ curve, beads, speed: 0.06 + idx * 0.01 });
      });

      // ============================================================
      // ===== 변경 #6: 돈(매출) 흐름 (팹 → HQ 옥상, 금색 코인) =====
      // ============================================================
      const moneyPaths = [];
      fabPositions.forEach(([fx, fy, fz, label], idx) => {
        const start = new THREE.Vector3(fx - 0.4, 1.3, fz);
        // 위로 올라갔다가 HQ 옥상으로 내려오는 아치
        const mid = new THREE.Vector3((fx + HQ_X) / 2, 2.8, (fz + HQ_Z) / 2);
        const end = new THREE.Vector3(HQ_X, 2.5, HQ_Z);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const coins = [];
        for (let i = 0; i < 4; i++) {
          const coin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.018, 16),
            M.goldCoin.clone()
          );
          coin.castShadow = false;
          const coinLight = new THREE.PointLight('#ffd700', 0.15, 0.5);
          coin.add(coinLight);
          g.add(coin);
          coins.push({ mesh: coin, light: coinLight, offset: i / 4 });
        }
        moneyPaths.push({ curve, coins, speed: 0.05 + idx * 0.005 });
      });

      // 컨베이어 벨트
      const conveyorY = 0.16;
      const conveyorZ = 0.85;
      box(g, 'conveyor base', 0.0, conveyorY, conveyorZ, 3.6, 0.06, 0.35, M.conveyorBase);
      box(g, 'conveyor belt', 0.0, conveyorY + 0.035, conveyorZ, 3.6, 0.02, 0.32, M.conveyorBelt);
      const rollerL = cyl(g, 'conveyor roller left', -1.85, conveyorY + 0.02, conveyorZ, 0.05, 0.35, M.metal, 12);
      rollerL.rotation.x = Math.PI / 2;
      const rollerR = cyl(g, 'conveyor roller right', 1.85, conveyorY + 0.02, conveyorZ, 0.05, 0.35, M.metal, 12);
      rollerR.rotation.x = Math.PI / 2;
      for (let i = 0; i < 4; i++) {
        const lx = -1.6 + i * 1.07;
        box(g, `conveyor leg ${i}`, lx, conveyorY - 0.04, conveyorZ + 0.12, 0.04, 0.08, 0.04, M.metal);
        box(g, `conveyor leg back ${i}`, lx, conveyorY - 0.04, conveyorZ - 0.12, 0.04, 0.08, 0.04, M.metal);
      }

      const conveyorProducts = [];
      const productTypes = ['phone', 'dram', 'tv', 'ssd', 'phone', 'dram'];
      productTypes.forEach((type, i) => {
        const offset = i / productTypes.length;
        const productGroup = new THREE.Group();
        const pkg = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.1, 0.16),
          mat('#8a6440', { roughness: 0.8 })
        );
        productGroup.add(pkg);
        if (type === 'phone') {
          const mini = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.005), M.phoneBody);
          mini.position.set(0, 0.07, 0);
          productGroup.add(mini);
        } else if (type === 'dram') {
          const mini = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.005), M.dramPCB);
          mini.position.set(0, 0.07, 0);
          productGroup.add(mini);
        } else if (type === 'tv') {
          const mini = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.005), M.tvFrame);
          mini.position.set(0, 0.07, 0);
          productGroup.add(mini);
        } else if (type === 'ssd') {
          const mini = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.04), M.ssdBody);
          mini.position.set(0, 0.07, 0);
          productGroup.add(mini);
        }
        productGroup.position.set(-1.7 + offset * 3.5, conveyorY + 0.1, conveyorZ);
        productGroup.castShadow = true;
        g.add(productGroup);
        conveyorProducts.push({ group: productGroup, offset });
      });

      // ============================================================
      // ===== 사옥 정면 디스플레이 (HQ 이동 반영) =====
      // ============================================================
      const phoneDisp = createPhone(g, HQ_X - 0.2, 0.46, HQ_Z + 1.05, 1.1);
      const tvDisp = createTV(g, HQ_X + 0.35, 0.45, HQ_Z + 1.05, 0.9);
      const dramDisp = createDRAM(g, HQ_X - 0.8, 0.46, HQ_Z + 1.05, 1.0);
      productLabel(g, 'Galaxy', HQ_X - 0.2, 0.68, HQ_Z + 1.05, 0.18, 0.06);
      productLabel(g, 'QLED TV', HQ_X + 0.35, 0.68, HQ_Z + 1.05, 0.22, 0.06);
      productLabel(g, 'DRAM', HQ_X - 0.8, 0.68, HQ_Z + 1.05, 0.18, 0.06);

      // ============================================================
      // ===== 변경 #8: 하만 카돈 (TV 디스플레이 우측 작은 부속) =====
      // ============================================================
      box(g, 'harman kardon box',
        HQ_X + 0.85, 0.36, HQ_Z + 1.05,
        0.32, 0.26, 0.22, mat('#0a0a0a', { roughness: 0.4, metalness: 0.5 }));
      harmanLabel(g, HQ_X + 0.85, 0.4, HQ_Z + 1.165, 0.3, 0.08);
      box(g, 'harman top trim',
        HQ_X + 0.85, 0.5, HQ_Z + 1.05,
        0.34, 0.012, 0.24, mat('#d4af6a', { roughness: 0.3, metalness: 0.7 }));

      // 옥상 폰 2개 (HQ 이동 반영)
      const roofPhone1 = createPhone(g, HQ_X - 0.7, 3.13, HQ_Z + 0.6, 0.7);
      roofPhone1.group.rotation.x = -Math.PI / 8;
      roofPhone1.group.rotation.z = -Math.PI / 12;
      const roofPhone2 = createPhone(g, HQ_X + 0.7, 3.13, HQ_Z + 0.6, 0.7);
      roofPhone2.group.rotation.x = -Math.PI / 8;
      roofPhone2.group.rotation.z = Math.PI / 12;

      const phones = [phoneDisp, roofPhone1, roofPhone2];
      const tvs = [tvDisp];

      // 차량
      box(g, 'blue logistics truck cabin', .45, .24, 1.6, .32, .28, .32, M.blue);
      box(g, 'blue logistics truck cargo', .82, .28, 1.6, .58, .34, .34, M.white);
      box(g, 'white company car A', HQ_X - 0.35, .13, HQ_Z + 1.55, .35, .12, .22, M.white);

      // 나무
      tree(g, -2.0, -1.55, .48);
      tree(g, 2.0, -1.55, .46);
      tree(g, 2.0, 1.55, .42);
      tree(g, -2.2, 0.5, .42);

      // 글로우
      const glow = new THREE.PointLight('#fff2c8', .5, 3);
      glow.position.set(HQ_X, 1.5, HQ_Z);
      g.add(glow);
      const fabGlow = new THREE.PointLight('#4d8dff', .7, 3.5);
      fabGlow.position.set(1.35, 1.2, -0.25);
      g.add(fabGlow);
      const displayGlow = new THREE.PointLight('#fff8e0', 0.6, 1.8);
      displayGlow.position.set(HQ_X - 0.1, 0.7, HQ_Z + 1.15);
      g.add(displayGlow);
      const goldGlow = new THREE.PointLight('#ffd700', 0.5, 2.0);
      goldGlow.position.set(HQ_X, 2.6, HQ_Z);
      g.add(goldGlow);

      g.userData = {
        floorWindows, beam, beamBase, dishPivot, dishLed,
        fabScanLines, steamBeads, dataPaths, fabSplashLights,
        moneyPaths, goldGlow,
        conveyorProducts, phones, tvs
      };
      return g;
    }

    function tree(g, x, z, s = .5) {
      cyl(g, 'tree trunk', x, .23 * s / .5, z, .035, .38 * s / .5, mat('#7a4b2a', { roughness: .8 }), 10);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(.18 * s / .5, 18, 12), M.green);
      crown.position.set(x, .52 * s / .5, z);
      crown.castShadow = true;
      crown.receiveShadow = true;
      g.add(crown);
    }
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
