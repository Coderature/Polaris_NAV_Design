import type { SectorDef, StockRow } from '../types';
import { computeLayout, type StockRect } from '../layout/squarify';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { fitBuildingModelToLot, loadBuildingTemplates, type BuildingTemplateLibrary } from './buildingTemplates';
import { CUSTOM_DETAILS } from './customDetails';

export const CAMERA_PRESETS = {
  '3d': { pos: [20, 25, 25] as const, look: [0, 0, 0] as const },
  top: { pos: [0, 50, 0.01] as const, look: [0, 0, 0] as const },
  front: { pos: [0, 8, 35] as const, look: [0, 0, 0] as const },
} as const;

export type CameraPresetKey = keyof typeof CAMERA_PRESETS;

/** Neutral tower façade (no 등락 red/blue); subtle lightness varies per ticker. */
export function getBuildingColor(stock: StockRow): THREE.Color {
  if (stock.halted) return new THREE.Color(0x555f70);
  const seed = tickerStyleSeed(stock.t);
  const l = 0.34 + ((seed % 13) / 13) * 0.12;
  return new THREE.Color().setHSL(0, 0, l);
}

/** Tower height above ground — up days scrape the sky, down days stay stubby (tycoon skyline). */
function computeTowerHeight(st: StockRow): number {
  const BASE = 0.42;
  const UP_MAX = 9.0;
  const DOWN_MAX = 3.1;
  const SCALE = 4.0;
  if (st.halted) return 0.36;
  const chg = st.chg ?? 0;
  const norm = Math.min(1, Math.abs(chg) / SCALE);
  const curve = Math.sqrt(norm);
  if (chg >= 0) return BASE + curve * (UP_MAX - BASE);
  return BASE + curve * (DOWN_MAX - BASE);
}

function tickerStyleSeed(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
  return Math.abs(h);
}

const factorySectors = new Set(['Industrials', 'Energy', 'Materials']);

function tintSubtreeMeshesNeutral(root: THREE.Object3D, stock: StockRow) {
  const bodyColor = getBuildingColor(stock);
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const prev = child.material;
    let map: THREE.Texture | null = null;
    let normalMap: THREE.Texture | null = null;
    if (Array.isArray(prev)) {
      const pm = prev[0] as THREE.MeshStandardMaterial;
      map = pm?.map ?? null;
      normalMap = pm?.normalMap ?? null;
      prev.forEach((m) => m.dispose?.());
    } else {
      const pm = prev as THREE.MeshStandardMaterial;
      map = pm?.map ?? null;
      normalMap = pm?.normalMap ?? null;
      prev.dispose?.();
    }
    child.material = new THREE.MeshStandardMaterial({
      color: bodyColor.clone(),
      roughness: 0.52,
      metalness: 0.08,
      emissive: bodyColor.clone().multiplyScalar(0.06),
      map,
      normalMap,
    });
  });
}

const LOGO_URL_BY_TICKER: Record<string, string> = {
  AAPL: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/apple.svg',
  MSFT: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoft.svg',
  GOOGL: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/google.svg',
  GOOG: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/google.svg',
  AMZN: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazon.svg',
  TSLA: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tesla.svg',
  NFLX: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/netflix.svg',
  META: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/facebook.svg',
  NVDA: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/nvidia.svg',
  INTC: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/intel.svg',
};

function getLogoUrl(ticker: string, name?: string) {
  const upperTicker = ticker.toUpperCase();
  if (LOGO_URL_BY_TICKER[upperTicker]) {
    return LOGO_URL_BY_TICKER[upperTicker];
  }

  const lowerName = name?.toLowerCase() ?? '';
  if (lowerName.includes('apple')) return 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/apple.svg';
  if (lowerName.includes('microsoft')) return 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/microsoft.svg';
  if (lowerName.includes('google')) return 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/google.svg';
  if (lowerName.includes('amazon')) return 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazon.svg';
  if (lowerName.includes('tesla')) return 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tesla.svg';

  return `/logos/${ticker}.png`;
}

function createTickerFallbackTexture(ticker: string) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, size, size * 0.3);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ticker.slice(0, 3).toUpperCase(), size / 2, size / 2 + 12);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Roof strip: ticker text (left side of sprite quad). */
function createRoofTickerTexture(ticker: string): THREE.CanvasTexture {
  const cw = 384;
  const ch = 112;
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = '#e8eef7';
  ctx.font = 'bold 56px "JetBrains Mono", "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const t = ticker.length > 8 ? ticker.slice(0, 7) + '…' : ticker;
  ctx.fillText(t.toUpperCase(), 18, ch / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image ${url}`));
    image.src = url;
  });
}

function createCanvasTextureFromImage(image: HTMLImageElement): THREE.Texture {
  const width = Math.max(128, image.width || 128);
  const height = Math.max(128, image.height || 128);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

async function createImageTexture(url: string): Promise<THREE.Texture> {
  const isSvg = url.toLowerCase().endsWith('.svg');
  if (isSvg) {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`Failed to fetch SVG ${url}`);
    const svgText = await response.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    try {
      const image = await loadImageElement(blobUrl);
      return createCanvasTextureFromImage(image);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }
  const image = await loadImageElement(url);
  return createCanvasTextureFromImage(image);
}

/** Opaque ground pad covering the stock cell so sector hologram does not show through. */
function addOpaqueLotPad(group: THREE.Group, r: StockRect) {
  const w = Math.max(0.15, r.w - 0.015);
  const h = Math.max(0.15, r.h - 0.015);
  const padGeo = new THREE.PlaneGeometry(w, h);
  const padMat = new THREE.MeshBasicMaterial({
    color: 0x030508,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.028;
  pad.renderOrder = -2;
  group.add(pad);
}

/** Ticker (left) + brand logo (right), logo keeps texture colors (no tone mapping tint). */
function addTickerAndLogoSprites(root: THREE.Object3D, ticker?: string, name?: string) {
  if (!ticker) return;

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const height = size.y || 1;
  const logoSize = Math.max(0.45, Math.min(1.15, height * 0.35));
  const spacing = 0.07;
  const tickerTex = createRoofTickerTexture(ticker);
  const tickerMat = new THREE.SpriteMaterial({
    map: tickerTex,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
    color: 0xffffff,
  });
  const tickerSprite = new THREE.Sprite(tickerMat);
  const tw = logoSize * 1.25;
  const th = logoSize * 0.38;
  tickerSprite.scale.set(tw, th, 1);

  const logoMat = new THREE.SpriteMaterial({
    transparent: true,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
    color: 0xffffff,
    map: createTickerFallbackTexture(ticker),
  });
  const logoSprite = new THREE.Sprite(logoMat);
  logoSprite.scale.set(logoSize, logoSize, 1);

  const yRoof = height + 0.28;
  tickerSprite.position.set(-(logoSize / 2 + spacing + tw / 2), yRoof, 0);
  logoSprite.position.set(tw / 2 + spacing + logoSize / 2, yRoof, 0);
  tickerSprite.visible = true;
  logoSprite.visible = true;
  root.add(tickerSprite);
  root.add(logoSprite);

  const url = getLogoUrl(ticker, name);
  createImageTexture(url)
    .catch(() => createImageTexture(`/logos/${ticker}.png`))
    .then((texture) => {
      logoMat.map?.dispose?.();
      logoMat.map = texture;
      logoMat.needsUpdate = true;
    })
    .catch(() => {
      // Keep the generated fallback if both remote and local fail.
    });
}

const oilTickerSet = new Set(['XOM', 'CVX', 'OXY']);

function isWindMotionStock(st: StockRow): boolean {
  return /wind/i.test(st.n) || /WIND/.test(st.t);
}

function isOilMotionStock(st: StockRow, sec: SectorDef): boolean {
  return oilTickerSet.has(st.t) || sec.id === 'ENERGY' || /oil|exxon|petro/i.test(st.n.toLowerCase());
}

function createWindTurbineMarker(height: number): THREE.Group {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.4,
    emissive: 0x0b2040,
    emissiveIntensity: 0.03,
  });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, height * 0.45, 8), mat);
  tower.position.y = height * 0.225;

  const rotor = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mat);
  rotor.add(hub);
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xe5f3ff,
    roughness: 0.3,
    metalness: 0.35,
  });
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5, 0.08), bladeMat);
    blade.position.y = 0.25;
    blade.rotation.z = (Math.PI * 2 * i) / 3;
    blade.rotation.y = Math.PI / 2;
    rotor.add(blade);
  }
  rotor.position.y = height * 0.45;
  rotor.userData = { rotationRate: 1.35 };

  const group = new THREE.Group();
  group.add(tower, rotor);
  group.userData = { rotor };
  return group;
}

function createPumpjackMarker(height: number): THREE.Group {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xd4b475,
    roughness: 0.35,
    metalness: 0.45,
    emissive: 0x1f1308,
    emissiveIntensity: 0.04,
  });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.18), mat);
  base.position.y = 0.03;
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.06, height * 0.22, 0.06), mat);
  mast.position.y = height * 0.11 + 0.03;

  const armPivot = new THREE.Group();
  armPivot.position.y = height * 0.24 + 0.03;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.05), mat);
  arm.position.x = 0.21;
  const horsehead = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.06), mat);
  horsehead.position.set(0.42, 0, 0);
  armPivot.add(arm, horsehead);

  const group = new THREE.Group();
  group.add(base, mast, armPivot);
  group.userData = { armPivot, phase: 0 };
  return group;
}

function attachSectorMotion(root: THREE.Group, st: StockRow, sec: SectorDef) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const height = size.y || 1;
  if (isWindMotionStock(st)) {
    const turbine = createWindTurbineMarker(Math.max(0.8, height * 0.18));
    turbine.position.y = height + 0.15;
    root.add(turbine);
    root.userData.motion = {
      tick(dt: number) {
        const rotor = turbine.userData.rotor as THREE.Group | undefined;
        if (rotor) rotor.rotation.y += dt * 1.6;
      },
    };
    return;
  }

  if (isOilMotionStock(st, sec)) {
    const pump = createPumpjackMarker(Math.max(0.7, height * 0.16));
    pump.position.y = height + 0.15;
    root.add(pump);
    root.userData.motion = {
      phase: 0,
      tick(dt: number) {
        const pivot = (pump.userData as any).armPivot as THREE.Object3D | undefined;
        if (!pivot) return;
        this.phase += dt * 2.4;
        pivot.rotation.z = Math.sin(this.phase) * 0.35;
      },
    };
    return;
  }

  delete root.userData.motion;
}

/** Treemap cell inset — thin gap between adjacent lots. */
const LOT_GUTTER = 0.08;

function lotFootprint(r: StockRect): { footW: number; footD: number } {
  return {
    footW: Math.max(0.4, r.w - LOT_GUTTER),
    footD: Math.max(0.4, r.h - LOT_GUTTER),
  };
}

export class TreemapScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  readonly stockGroup = new THREE.Group();
  /** One THREE.Group per stock (building compound); raycast with recursive=true. */
  readonly meshByStock = new Map<StockRow, THREE.Group>();
  private readonly disposables: THREE.Object3D[] = [];
  private readonly secById: Record<string, SectorDef>;
  private camAnim = 0;
  private lastFrameTime = performance.now();
  private ro: ResizeObserver;

  /** Loads /models/buildings/*.glb then builds the scene (falls back to procedural meshes if none load). */
  static async create(
    canvas: HTMLCanvasElement,
    stocks: StockRow[],
    sectors: SectorDef[],
    wrap: HTMLElement,
  ): Promise<TreemapScene> {
    const buildingLib = await loadBuildingTemplates();
    return new TreemapScene(canvas, stocks, sectors, wrap, buildingLib);
  }

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly stocks: StockRow[],
    sectors: SectorDef[],
    private readonly wrap: HTMLElement,
    private readonly buildingLib: BuildingTemplateLibrary | null = null,
  ) {
    this.secById = Object.fromEntries(sectors.map((s) => [s.id, s]));

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 60, 220);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    const p0 = CAMERA_PRESETS['3d'].pos;
    this.camera.position.set(p0[0], p0[1], p0[2]);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.minDistance = 25;
    this.controls.maxDistance = 180;
    this.controls.target.set(0, 0, 0);

    const amb = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(40, 80, 30);
    this.scene.add(dir);
    const fillLight = new THREE.DirectionalLight(0x9fbfff, 0.25);
    fillLight.position.set(-50, 40, -20);
    this.scene.add(fillLight);

    const grid = new THREE.GridHelper(120, 30, 0x0a3a1a, 0x061a0c);
    grid.position.y = -0.01;
    const gMat = grid.material as THREE.Material;
    gMat.transparent = true;
    gMat.opacity = 0.35;
    this.scene.add(grid);

    const TREE_W = 90;
    const TREE_H = 70;
    const { sectorRects, stockRects } = computeLayout(stocks, TREE_W, TREE_H);

    const sectorGroup = new THREE.Group();
    this.scene.add(sectorGroup);

    for (const r of sectorRects) {
      const sec = this.secById[r.ref];
      const geo = new THREE.PlaneGeometry(r.w, r.h);
      const secCol = new THREE.Color(sec.color);
      const mat = new THREE.MeshBasicMaterial({
        color: secCol,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(r.x + r.w / 2, 0, r.y + r.h / 2);
      sectorGroup.add(mesh);
      this.track(mesh);

      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: secCol,
        transparent: true,
        opacity: 0.55,
      });
      const edge = new THREE.LineSegments(edgeGeo, edgeMat);
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(r.x + r.w / 2, 0.02, r.y + r.h / 2);
      sectorGroup.add(edge);
      this.track(edge);

      if (Math.min(r.w, r.h) > 6) {
        const label = this.makeLabel(sec.name, sec.color);
        label.position.set(r.x + r.w / 2, 0.1, r.y + r.h / 2);
        label.scale.set(Math.min(r.w * 0.5, 10), Math.min(r.w * 0.5, 10) * 0.18, 1);
        (label.material as THREE.SpriteMaterial).opacity = 0.35;
        sectorGroup.add(label);
        this.track(label);
      }
    }

    this.scene.add(this.stockGroup);
    for (const r of stockRects) {
      this.addStockBuilding(r);
    }

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(wrap);
    window.addEventListener('beforeunload', this.disposeAll);

    this.intro();
  }

  private track(obj: THREE.Object3D) {
    this.disposables.push(obj);
    return obj;
  }

  private disposeAll = () => {
    for (const o of this.disposables) {
      if (o instanceof THREE.Sprite) {
        const sm = o.material as THREE.SpriteMaterial;
        sm.map?.dispose();
        sm.dispose();
        continue;
      }
      if (o instanceof THREE.Group) {
        o.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Sprite) {
            child.geometry?.dispose();
            const mat = child.material;
            if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
            else mat?.dispose();
          }
        });
        continue;
      }
      if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
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

  private makeLabel(text: string, color = '#cbd2dc') {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext('2d')!;
    ctx.font = '600 56px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 48);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    return new THREE.Sprite(mat);
  }

  private clearBuildingGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      child.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
          o.geometry?.dispose();
          const mat = o.material;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        }
      });
    }
  }

  private buildStockBuildingContent(group: THREE.Group, r: StockRect, st: StockRow) {
    if (this.buildingLib) {
      this.buildGltfStockBuildingContent(group, r, st);
      return;
    }
    this.buildProceduralStockBuildingContent(group, r, st);
  }

  /** glTF variant scaled to the treemap cell; tinted by daily change color. */
  private buildGltfStockBuildingContent(group: THREE.Group, r: StockRect, st: StockRow) {
    this.clearBuildingGroup(group);
    const sec = this.secById[st.s];
    const { footW, footD } = lotFootprint(r);
    const H = computeTowerHeight(st);
    const seed = tickerStyleSeed(st.t);
    const bodyColor = getBuildingColor(st);

    const podiumMat = new THREE.MeshStandardMaterial({
      color: bodyColor.clone(),
      roughness: 0.88,
      metalness: 0.04,
    });
    const slabT = 0.1;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(footW, slabT, footD), podiumMat);
    slab.position.y = slabT / 2;
    group.add(slab);

    const model = this.buildingLib!.cloneVariant(seed, { preferFactory: factorySectors.has(sec.name) });
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
    fitBuildingModelToLot(model, footW, footD, H);
    model.position.y += slabT;

    group.add(model);
    tintSubtreeMeshesNeutral(model, st);
    addOpaqueLotPad(group, r);
    addTickerAndLogoSprites(group, st.t, st.n);
    attachSectorMotion(group, st, sec);

    const customBuilder = CUSTOM_DETAILS[st.t];
    if (customBuilder) {
      const fp = Math.min(footW, footD);
      customBuilder(group, H + slabT, fp);
    }

    group.userData.stock = st;
    group.userData.rect = r;
    group.userData.baseColor = bodyColor;
  }

  /** Stacked building: neutral slab/cap; main body = daily change color. */
  private buildProceduralStockBuildingContent(group: THREE.Group, r: StockRect, st: StockRow) {
    this.clearBuildingGroup(group);
    addOpaqueLotPad(group, r);
    const sec = this.secById[st.s];
    const { footW, footD } = lotFootprint(r);
    const H = computeTowerHeight(st);
    const bodyColor = getBuildingColor(st);
    const capNeutral = new THREE.Color(0x252b38);

    let yTop = 0;

    const slabT = 0.08;
    const slabMat = new THREE.MeshStandardMaterial({ color: 0x232a36, roughness: 0.9, metalness: 0.02 });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(footW, slabT, footD), slabMat);
    slab.position.y = yTop + slabT / 2;
    group.add(slab);
    yTop += slabT;

    const bodyInset = 0.7;
    const bodyW = footW * bodyInset;
    const bodyD = footD * bodyInset;
    const bodyH = Math.max(0.25, H * 0.75);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.52,
      metalness: 0.08,
      emissive: bodyColor.clone().multiplyScalar(0.06),
    });
    const bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = yTop + bodyH / 2;
    group.add(body);

    const edgeGeo = new THREE.EdgesGeometry(bodyGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.12 });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    edges.position.copy(body.position);
    group.add(edges);
    yTop += bodyH;

    const capH = Math.max(0.06, H * 0.04);
    const capMat = new THREE.MeshStandardMaterial({
      color: capNeutral,
      roughness: 0.35,
      metalness: 0.2,
      emissive: capNeutral.clone().multiplyScalar(0.05),
    });
    const cap = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.06, capH, bodyD + 0.06), capMat);
    cap.position.y = yTop + capH / 2;
    group.add(cap);

    addTickerAndLogoSprites(group, st.t, st.n);
    attachSectorMotion(group, st, sec);

    const customBuilder = CUSTOM_DETAILS[st.t];
    if (customBuilder) {
      const fp = Math.min(footW, footD);
      customBuilder(group, yTop, fp);
    }

    group.userData.stock = st;
    group.userData.rect = r;
    group.userData.baseColor = bodyColor;
  }

  private addStockBuilding(r: StockRect) {
    const st = r.ref;
    const group = new THREE.Group();
    group.position.set(r.x + r.w / 2, 0, r.y + r.h / 2);
    this.buildStockBuildingContent(group, r, st);
    this.stockGroup.add(group);
    this.track(group);
    this.meshByStock.set(st, group);
  }

  updateAllVisuals() {
    for (const [st, group] of this.meshByStock) {
      const r = group.userData.rect as StockRect;
      group.position.set(r.x + r.w / 2, 0, r.y + r.h / 2);
      this.buildStockBuildingContent(group, r, st);
    }
  }

  private updateAnimations(dt: number) {
    for (const [, group] of this.meshByStock) {
      const motion = group.userData.motion as { tick?: (dt: number) => void } | undefined;
      motion?.tick(dt);
    }
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
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.controls.update();
    this.updateAnimations(dt);
    this.resize();
    this.renderer.render(this.scene, this.camera);
  }

  animateCamera(mode: '3d' | 'top' | 'front') {
    const preset = CAMERA_PRESETS[mode];
    const target = { x: preset.pos[0], y: preset.pos[1], z: preset.pos[2] };
    const look = { x: preset.look[0], y: preset.look[1], z: preset.look[2] };
    if (this.camAnim) cancelAnimationFrame(this.camAnim);
    const start = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };
    const startLook = this.controls.target.clone();
    const t0 = performance.now();
    const dur = 700;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      this.camera.position.set(
        start.x + (target.x - start.x) * e,
        start.y + (target.y - start.y) * e,
        start.z + (target.z - start.z) * e,
      );
      this.controls.target.set(
        startLook.x + (look.x - startLook.x) * e,
        startLook.y + (look.y - startLook.y) * e,
        startLook.z + (look.z - startLook.z) * e,
      );
      if (k < 1) this.camAnim = requestAnimationFrame(step);
    };
    this.camAnim = requestAnimationFrame(step);
  }

  flyToStock(mesh: THREE.Object3D) {
    const p = mesh.position;
    if (this.camAnim) cancelAnimationFrame(this.camAnim);
    const start = this.camera.position.clone();
    const target = new THREE.Vector3(p.x, 30, p.z + 25);
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
    const end = CAMERA_PRESETS['3d'].pos;
    const t0 = performance.now();
    const start = { x: end[0], y: 130, z: end[2] + 45 };
    this.camera.position.set(start.x, start.y, start.z);
    this.controls.target.set(CAMERA_PRESETS['3d'].look[0], CAMERA_PRESETS['3d'].look[1], CAMERA_PRESETS['3d'].look[2]);
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

  getSector(id: string) {
    return this.secById[id];
  }
}
