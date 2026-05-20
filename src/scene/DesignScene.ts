import type { SectorDef, StockRow } from '../types';

import * as THREE from 'three';
import { MOUSE } from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {

  createAlibaba,

  createAmazonWarehouse,

  createAppleCampus,

  createBankOfAmerica,

  createBoeing,

  createExxonMobil,

  createNvidiaFab,

  createGoogleDC,

  createHyundaiMotor,

  createLGEnergySolution,

  createPdd,

  createSamsungBiologics,

  createSamsungFab,

  createSOilRefinery,

  createTesla,

} from './buildingTemplates';

import {
  VILLAGE_BORDER_HEIGHT,
  VILLAGE_BORDER_WIDTH,
  VILLAGE_CAMERA_DEFAULT,
  VILLAGE_FOG_FAR,
  VILLAGE_FOG_NEAR,
  VILLAGE_GRID_COLS,
  VILLAGE_GRID_ROWS,
  VILLAGE_GRID_SPACING,
  VILLAGE_MODEL_SCALE_XZ,
  VILLAGE_ORBIT_MAX_DISTANCE,
  VILLAGE_ORBIT_MIN_DISTANCE,
  villageCellSize,
  villageFloorSize,
} from './villageScale';



const TICKER_ORDER = ['AAPL', 'GOOGL', 'NVDA', 'AMZN', 'BA', 'TSLA', '005930', '010950'] as const;



const BUILDER_BY_TICKER: Record<string, () => THREE.Group> = {

  BA: createBoeing,

  XOM: createExxonMobil,

  '005930': createSamsungFab,

  '010950': createSOilRefinery,

  '373220': createLGEnergySolution,

  '005380': createHyundaiMotor,

  '207940': createSamsungBiologics,

  TSLA: createTesla,

  AAPL: createAppleCampus,

  AMZN: createAmazonWarehouse,

  GOOGL: createGoogleDC,

  NVDA: createNvidiaFab,

  BAC: createBankOfAmerica,

  BABA: createAlibaba,

  PDD: createPdd,

};



function gridPosition(index: number): { x: number; z: number; col: number; row: number } {

  const col = index % VILLAGE_GRID_COLS;

  const row = Math.floor(index / VILLAGE_GRID_COLS);

  const x = (col - (VILLAGE_GRID_COLS - 1) / 2) * VILLAGE_GRID_SPACING;

  const z = (row - (VILLAGE_GRID_ROWS - 1) / 2) * VILLAGE_GRID_SPACING;

  return { x, z, col, row };

}



function orderStocksBySector(stocks: StockRow[]): StockRow[] {

  const ordered = TICKER_ORDER.map((t) => stocks.find((s) => s.t === t)).filter((s): s is StockRow => !!s);

  const sectorOrder: string[] = [];

  for (const st of ordered) {

    if (!sectorOrder.includes(st.s)) sectorOrder.push(st.s);

  }

  return [...ordered].sort((a, b) => {

    const sa = sectorOrder.indexOf(a.s);

    const sb = sectorOrder.indexOf(b.s);

    if (sa !== sb) return sa - sb;

    return TICKER_ORDER.indexOf(a.t as (typeof TICKER_ORDER)[number]) - TICKER_ORDER.indexOf(b.t as (typeof TICKER_ORDER)[number]);

  });

}



function addSectorRegion(

  scene: THREE.Scene,

  track: (o: THREE.Object3D) => THREE.Object3D,

  color: string,

  cx: number,

  cz: number,

  w: number,

  d: number,

) {

  const hex = new THREE.Color(color);

  const plane = new THREE.Mesh(

    new THREE.PlaneGeometry(w, d),

    new THREE.MeshBasicMaterial({

      color: hex,

      transparent: true,

      opacity: 0.12,

      depthWrite: false,

      side: THREE.DoubleSide,

    }),

  );

  plane.rotation.x = -Math.PI / 2;

  plane.position.set(cx, 0.012, cz);

  scene.add(track(plane));

  const hw = w / 2;

  const hd = d / 2;

  const y = 0.024;

  const t = VILLAGE_BORDER_WIDTH;

  const borderMat = new THREE.MeshBasicMaterial({

    color: hex,

    transparent: true,

    opacity: 0.95,

    depthWrite: false,

  });

  const addEdge = (sx: number, sz: number, px: number, pz: number) => {

    const edge = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.028, sz), borderMat);

    edge.position.set(px, y, pz);

    scene.add(track(edge));

  };

  addEdge(w + t * 2, t, cx, cz - hd - t / 2);

  addEdge(w + t * 2, t, cx, cz + hd + t / 2);

  addEdge(t, d + t * 2, cx - hw - t / 2, cz);

  addEdge(t, d + t * 2, cx + hw + t / 2, cz);

}



const DEFAULT_CAMERA_POS = VILLAGE_CAMERA_DEFAULT;

const DEFAULT_TARGET = [0, 0, 0] as const;



const PLACEHOLDER_MAT = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.55, metalness: 0.05 });



export class DesignScene {

  readonly renderer: THREE.WebGLRenderer;

  readonly scene = new THREE.Scene();

  readonly camera: THREE.PerspectiveCamera;

  readonly controls: OrbitControls;

  readonly stockGroup = new THREE.Group();

  readonly meshByStock = new Map<StockRow, THREE.Group>();

  private readonly disposables: THREE.Object3D[] = [];

  private camAnim = 0;

  private ro: ResizeObserver;



  static create(

    canvas: HTMLCanvasElement,

    stocks: StockRow[],

    sectors: SectorDef[],

    wrap: HTMLElement,

  ): DesignScene {

    return new DesignScene(canvas, stocks, sectors, wrap);

  }



  constructor(

    private readonly canvas: HTMLCanvasElement,

    stocks: StockRow[],

    sectors: SectorDef[],

    private readonly wrap: HTMLElement,

  ) {

    const ordered = orderStocksBySector(stocks);

    const sectorById = Object.fromEntries(sectors.map((s) => [s.id, s])) as Record<string, SectorDef>;



    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.renderer.shadowMap.enabled = true;

    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;



    this.scene.background = new THREE.Color(0x0a0e14);
    this.scene.fog = new THREE.Fog(0x0a0e14, VILLAGE_FOG_NEAR, VILLAGE_FOG_FAR);



    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 500);

    this.camera.position.set(DEFAULT_CAMERA_POS[0], DEFAULT_CAMERA_POS[1], DEFAULT_CAMERA_POS[2]);



    this.controls = new OrbitControls(this.camera, canvas);

    this.controls.enableDamping = true;

    this.controls.dampingFactor = 0.08;

    this.controls.enableRotate = true;

    this.controls.enableZoom = true;

    this.controls.enablePan = true;

    this.controls.panSpeed = 1.15;

    // Left drag pans (map-style); right drag rotates. Shift+left drag rotates (OrbitControls default swap).
    this.controls.mouseButtons = {
      LEFT: MOUSE.PAN,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.ROTATE,
    };

    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;

    this.controls.minDistance = VILLAGE_ORBIT_MIN_DISTANCE;

    this.controls.maxDistance = VILLAGE_ORBIT_MAX_DISTANCE;

    this.controls.target.set(DEFAULT_TARGET[0], DEFAULT_TARGET[1], DEFAULT_TARGET[2]);



    const amb = new THREE.AmbientLight(0xffffff, 0.4);

    const dir = new THREE.DirectionalLight(0xffffff, 2.0);

    dir.position.set(12, 22, 14);

    dir.castShadow = true;

    dir.shadow.mapSize.set(2048, 2048);

    dir.shadow.camera.near = 0.5;

    dir.shadow.camera.far = 150;

    const sr = VILLAGE_GRID_SPACING * 3.2;

    dir.shadow.camera.left = -sr;

    dir.shadow.camera.right = sr;

    dir.shadow.camera.top = sr;

    dir.shadow.camera.bottom = -sr;

    const hemi = new THREE.HemisphereLight(0xdceaff, 0x1a1f2a, 1.2);

    this.scene.add(amb, dir, hemi);



    const { w: floorW, d: floorD } = villageFloorSize();

    const floor = new THREE.Mesh(

      new THREE.PlaneGeometry(floorW, floorD),

      new THREE.MeshBasicMaterial({

        color: 0x8fe6b8,

        transparent: true,

        opacity: 0.32,

        depthWrite: false,

        side: THREE.DoubleSide,

      }),

    );

    floor.rotation.x = -Math.PI / 2;

    floor.position.y = 0.018;

    this.scene.add(this.track(floor));



    const sectorCellSize = villageCellSize();

    ordered.forEach((st, i) => {

      const sec = sectorById[st.s];

      if (!sec) return;

      const { x, z } = gridPosition(i);

      addSectorRegion(this.scene, (o) => this.track(o), sec.color, x, z, sectorCellSize, sectorCellSize);

    });



    this.scene.add(this.stockGroup);

    ordered.forEach((st, i) => this.addStockBuilding(st, i));



    this.ro = new ResizeObserver(() => this.resize());

    this.ro.observe(wrap);

    window.addEventListener('beforeunload', this.disposeAll);



    this.intro();

  }



  setHoveredSector(_sectorId: string | null) {

    /* sector highlight via 3D regions */

  }



  resetOrbitCamera() {

    if (this.camAnim) cancelAnimationFrame(this.camAnim);

    const start = this.camera.position.clone();

    const targetPos = new THREE.Vector3(DEFAULT_CAMERA_POS[0], DEFAULT_CAMERA_POS[1], DEFAULT_CAMERA_POS[2]);

    const startLook = this.controls.target.clone();

    const endLook = new THREE.Vector3(DEFAULT_TARGET[0], DEFAULT_TARGET[1], DEFAULT_TARGET[2]);

    const t0 = performance.now();

    const step = (t: number) => {

      const k = Math.min(1, (t - t0) / 900);

      const e = 1 - Math.pow(1 - k, 3);

      this.camera.position.lerpVectors(start, targetPos, e);

      this.controls.target.lerpVectors(startLook, endLook, e);

      if (k < 1) this.camAnim = requestAnimationFrame(step);

    };

    this.camAnim = requestAnimationFrame(step);

  }



  private track(obj: THREE.Object3D) {

    this.disposables.push(obj);

    return obj;

  }



  private disposeAll = () => {

    for (const o of this.disposables) {

      if (o instanceof THREE.Mesh || o instanceof THREE.Line) {

        o.geometry?.dispose();

        const mat = o.material;

        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());

        else mat?.dispose();

      } else if (o instanceof THREE.Light) {

        o.dispose();

      }

    }

  };



  dispose() {

    window.removeEventListener('beforeunload', this.disposeAll);

    this.ro.disconnect();

    this.controls.dispose();

    this.renderer.dispose();

    this.disposeAll();

  }



  private addStockBuilding(st: StockRow, gridIndex: number) {

    const { x, z } = gridPosition(gridIndex);

    const group = new THREE.Group();

    group.position.set(x, 0, z);

    group.userData.stock = st;

    group.scale.set(VILLAGE_MODEL_SCALE_XZ, 1, VILLAGE_MODEL_SCALE_XZ);

    group.userData.footprintRestXZ = VILLAGE_MODEL_SCALE_XZ;



    const build = BUILDER_BY_TICKER[st.t];

    if (build) {
      try {
        group.add(build());
      } catch (err) {
        console.error(`[DesignScene] building ${st.t} failed:`, err);
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), PLACEHOLDER_MAT);
        mesh.position.y = 0.5;
        group.add(mesh);
      }
    } else {

      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), PLACEHOLDER_MAT);

      mesh.position.y = 0.5;

      group.add(mesh);

    }



    this.stockGroup.add(group);

    this.track(group);

    this.meshByStock.set(st, group);

  }



  resize() {

    const w = this.canvas.clientWidth;

    const h = this.canvas.clientHeight;

    if (w < 2 || h < 2) return;

    if (this.canvas.width !== w * this.renderer.getPixelRatio() || this.canvas.height !== h * this.renderer.getPixelRatio()) {
      this.renderer.setSize(w, h, false);
    }

    this.camera.aspect = w / h;

    this.camera.updateProjectionMatrix();

  }



  tick() {

    this.controls.update();

    this.resize();

    const now = performance.now() * 0.001;

    this.stockGroup.traverse((o) => {
      const fn = o.userData.tick as ((t: number) => void) | undefined;
      if (typeof fn !== 'function') return;
      try {
        fn(now);
      } catch (err) {
        console.error(`[DesignScene] tick failed on ${o.name || o.type}:`, err);
      }
    });

    this.renderer.render(this.scene, this.camera);

  }



  flyToStock(mesh: THREE.Object3D) {

    const p = mesh.position;

    if (this.camAnim) cancelAnimationFrame(this.camAnim);

    const start = this.camera.position.clone();

    const target = new THREE.Vector3(p.x, 32, p.z + 28);

    const t0 = performance.now();

    const step = (t: number) => {

      const k = Math.min(1, (t - t0) / 700);

      const e = 1 - Math.pow(1 - k, 3);

      this.camera.position.lerpVectors(start, target, e);

      this.controls.target.set(p.x, 0, p.z);

      if (k < 1) this.camAnim = requestAnimationFrame(step);

    };

    this.camAnim = requestAnimationFrame(step);

  }



  private intro() {

    const end = DEFAULT_CAMERA_POS;

    const t0 = performance.now();

    const start = { x: end[0], y: 35, z: end[2] };

    this.camera.position.set(start.x, start.y, start.z);

    this.controls.target.set(DEFAULT_TARGET[0], DEFAULT_TARGET[1], DEFAULT_TARGET[2]);

    const step = (t: number) => {

      const k = Math.min(1, (t - t0) / 1500);

      const e = 1 - Math.pow(1 - k, 3);

      this.camera.position.set(

        start.x + (end[0] - start.x) * e,

        start.y + (end[1] - start.y) * e,

        start.z + (end[2] - start.z) * e,

      );

      if (k < 1) requestAnimationFrame(step);

    };

    requestAnimationFrame(step);

  }

}


