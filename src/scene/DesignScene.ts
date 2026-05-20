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



const GRID_COLS = 4;

const GRID_ROWS = 2;

const GRID_SPACING = 10.0;

/** Village miniature scale (buildings + per-stock ground plinths). */
const VILLAGE_MODEL_SCALE = 1.58;

/** Green village floor plane area (XZ only). */
const VILLAGE_GROUND_AREA_SCALE = 1.32;

/** Per-cell sector tile inset from grid edge (0–0.5), prevents heatmap overlap. */
const SECTOR_CELL_INSET = 0.01;



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

  const col = index % GRID_COLS;

  const row = Math.floor(index / GRID_COLS);

  const x = (col - (GRID_COLS - 1) / 2) * GRID_SPACING;

  const z = (row - (GRID_ROWS - 1) / 2) * GRID_SPACING;

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

      opacity: 0.08,

      depthWrite: false,

      side: THREE.DoubleSide,

    }),

  );

  plane.rotation.x = -Math.PI / 2;

  plane.position.set(cx, 0.01, cz);

  scene.add(track(plane));



  const hw = w / 2;

  const hd = d / 2;

  const y = 0.02;

  const borderPoints = [

    new THREE.Vector3(cx - hw, y, cz - hd),

    new THREE.Vector3(cx + hw, y, cz - hd),

    new THREE.Vector3(cx + hw, y, cz + hd),

    new THREE.Vector3(cx - hw, y, cz + hd),

    new THREE.Vector3(cx - hw, y, cz - hd),

  ];

  const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);

  const border = new THREE.Line(

    borderGeo,

    new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.9 }),

  );

  scene.add(track(border));

}



const DEFAULT_CAMERA_POS = [22, 19, 22] as const;

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



    this.scene.background = new THREE.Color(0x000000);



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

    this.controls.minDistance = 30;

    this.controls.maxDistance = 200;

    this.controls.target.set(DEFAULT_TARGET[0], DEFAULT_TARGET[1], DEFAULT_TARGET[2]);



    const amb = new THREE.AmbientLight(0xffffff, 0.42);

    const dir = new THREE.DirectionalLight(0xe8eeff, 1.08);

    dir.position.set(12, 22, 14);

    dir.castShadow = true;

    dir.shadow.mapSize.set(2048, 2048);

    dir.shadow.camera.near = 0.5;

    dir.shadow.camera.far = 150;

    const sr = GRID_SPACING * 4;

    dir.shadow.camera.left = -sr;

    dir.shadow.camera.right = sr;

    dir.shadow.camera.top = sr;

    dir.shadow.camera.bottom = -sr;

    const hemi = new THREE.HemisphereLight(0xaaccff, 0x202028, 0.35);

    this.scene.add(amb, dir, hemi);



    const floorW = (GRID_SPACING * GRID_COLS + 10) * VILLAGE_GROUND_AREA_SCALE;

    const floorD = (GRID_SPACING * GRID_ROWS + 10) * VILLAGE_GROUND_AREA_SCALE;

    const floor = new THREE.Mesh(

      new THREE.PlaneGeometry(floorW, floorD),

      new THREE.MeshBasicMaterial({

        color: 0x8fe6b8,

        transparent: true,

        opacity: 0.16,

        depthWrite: false,

        side: THREE.DoubleSide,

      }),

    );

    floor.rotation.x = -Math.PI / 2;

    floor.position.y = 0.018;

    this.scene.add(this.track(floor));



    const sectorCellSize = GRID_SPACING * (1 - SECTOR_CELL_INSET * 2);

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

    group.scale.set(VILLAGE_MODEL_SCALE, 1, VILLAGE_MODEL_SCALE);

    group.userData.footprintRestXZ = VILLAGE_MODEL_SCALE;



    const build = BUILDER_BY_TICKER[st.t];

    if (build) {

      group.add(build());

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

      if (typeof fn === 'function') fn(now);

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


