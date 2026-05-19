import type { SectorDef, StockRow } from '../types';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  createAlibaba,
  createAmazonWarehouse,
  createAppleCampus,
  createBankOfAmerica,
  createBoeing,
  createExxonMobil,
  createGoogleDC,
  createHyundaiMotor,
  createLGEnergySolution,
  createPdd,
  createSamsungBiologics,
  createSamsungFab,
  createSOilRefinery,
  createTesla,
} from './buildingTemplates';

const GRID_SPACING = 5.5;

const TICKER_ORDER = [
  'BA',
  'XOM',
  '005930',
  '010950',
  '373220',
  '005380',
  '207940',
  'TSLA',
  'AAPL',
  'AMZN',
  'GOOGL',
  'BAC',
  'BABA',
  'PDD',
] as const;

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
  BAC: createBankOfAmerica,
  BABA: createAlibaba,
  PDD: createPdd,
};

function gridDims(count: number): { cols: number; rows: number } {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return { cols, rows };
}

function gridPosition(index: number, cols: number, rows: number): { x: number; z: number } {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const x = (col - (cols - 1) / 2) * GRID_SPACING;
  const z = (row - (rows - 1) / 2) * GRID_SPACING;
  return { x, z };
}

const DEFAULT_CAMERA_POS = [22, 28, 26] as const;
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
  private readonly gridCols: number;
  private readonly gridRows: number;
  private camAnim = 0;
  private ro: ResizeObserver;

  static create(
    canvas: HTMLCanvasElement,
    stocks: StockRow[],
    _sectors: SectorDef[],
    wrap: HTMLElement,
  ): DesignScene {
    return new DesignScene(canvas, stocks, wrap);
  }

  constructor(
    private readonly canvas: HTMLCanvasElement,
    stocks: StockRow[],
    private readonly wrap: HTMLElement,
  ) {
    const ordered = TICKER_ORDER.map((t) => stocks.find((s) => s.t === t)).filter((s): s is StockRow => !!s);
    const { cols, rows } = gridDims(ordered.length);
    this.gridCols = cols;
    this.gridRows = rows;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene.background = new THREE.Color(0x030508);
    this.scene.fog = new THREE.Fog(0x030508, 95, 300);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
    this.camera.position.set(DEFAULT_CAMERA_POS[0], DEFAULT_CAMERA_POS[1], DEFAULT_CAMERA_POS[2]);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.minDistance = 30;
    this.controls.maxDistance = 200;
    this.controls.target.set(DEFAULT_TARGET[0], DEFAULT_TARGET[1], DEFAULT_TARGET[2]);

    const amb = new THREE.AmbientLight(0xffffff, 0.42);
    this.scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 1.08);
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
    this.scene.add(dir);

    const floorW = GRID_SPACING * cols + 10;
    const floorD = GRID_SPACING * rows + 10;
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

    this.scene.add(this.stockGroup);
    ordered.forEach((st, i) => this.addStockBuilding(st, i));

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(wrap);
    window.addEventListener('beforeunload', this.disposeAll);

    this.intro();
  }

  setHoveredSector(_sectorId: string | null) {
    /* design showcase: sector boundaries removed */
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
      if (o instanceof THREE.Mesh) {
        o.geometry?.dispose();
        const mat = o.material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
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
    const { x, z } = gridPosition(gridIndex, this.gridCols, this.gridRows);
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.userData.stock = st;
    group.userData.footprintRestXZ = 1;

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
    const start = { x: end[0], y: 130, z: end[2] + 45 };
    this.camera.position.set(start.x, start.y, start.z);
    this.controls.target.set(DEFAULT_TARGET[0], DEFAULT_TARGET[1], DEFAULT_TARGET[2]);
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1200);
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
