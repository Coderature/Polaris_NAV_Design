import type { SectorDef, StockRow } from '../types';
import { computeLayout, type StockRect } from '../layout/squarify';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { fitBuildingModelToLot, loadBuildingTemplates, type BuildingTemplateLibrary } from './buildingTemplates';
import { getSectorVisual, type SectorVisual } from './sectorVisuals';

function colorForReturn(st: StockRow): THREE.Color {
  if (st.halted) return new THREE.Color(0x4a5160);
  const c = st.chg ?? 0;
  if (c >= 0) {
    const t = Math.min(1, c / 4);
    return new THREE.Color().setHSL(0.34, 0.65, 0.55 - t * 0.2);
  }
  const t = Math.min(1, -c / 4);
  return new THREE.Color().setHSL(0, 0.7, 0.55 - t * 0.2);
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

function applySectorMaterial(root: THREE.Object3D, sector?: string) {
  const visual = getSectorVisual(sector);
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const prev = child.material;
    const next = new THREE.MeshStandardMaterial({
      color: new THREE.Color(visual.color),
      roughness: visual.roughness,
      metalness: visual.metalness ?? 0.1,
      emissive: visual.emissive ? new THREE.Color(visual.emissive) : new THREE.Color('#000000'),
      emissiveIntensity: visual.emissive ? 0.15 : 0,
      transparent: Array.isArray(prev) ? (prev[0]?.transparent ?? false) : prev.transparent ?? false,
      opacity: Array.isArray(prev) ? (prev[0]?.opacity ?? 1) : prev.opacity ?? 1,
      side: Array.isArray(prev) ? (prev[0]?.side ?? THREE.FrontSide) : prev.side ?? THREE.FrontSide,
      map: Array.isArray(prev) ? (prev[0]?.map ?? null) : prev.map ?? null,
      normalMap: Array.isArray(prev) ? (prev[0]?.normalMap ?? null) : prev.normalMap ?? null,
    });
    child.material = next;
    if (Array.isArray(prev)) {
      prev.forEach((m) => m.dispose?.());
    } else {
      prev?.dispose?.();
    }
  });
}

function addLogoSprite(root: THREE.Object3D, ticker?: string) {
  if (!ticker) return;
  const url = `/logos/${ticker}.png`;
  const textureLoader = new THREE.TextureLoader();
  const material = new THREE.SpriteMaterial({
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.visible = false;

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const height = size.y || 1;
  const logoSize = Math.max(0.35, Math.min(0.9, height * 0.25));
  sprite.scale.set(logoSize, logoSize, 1);
  sprite.position.set(0, height + 0.25, 0);
  root.add(sprite);

  textureLoader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      material.map = texture;
      material.needsUpdate = true;
      sprite.visible = true;
    },
    undefined,
    () => {
      if (sprite.parent) sprite.parent.remove(sprite);
      material.dispose();
    },
  );
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

    this.scene.background = null;
    this.scene.fog = new THREE.Fog(0x0a0b10, 60, 220);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    this.camera.position.set(0, 50, 70);

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

    const grid = new THREE.GridHelper(120, 30, 0x2a2f3e, 0x1a1d28);
    grid.position.y = -0.01;
    const gMat = grid.material as THREE.Material;
    gMat.transparent = true;
    gMat.opacity = 0.5;
    this.scene.add(grid);

    const TREE_W = 80;
    const TREE_H = 50;
    const { sectorRects, stockRects } = computeLayout(stocks, TREE_W, TREE_H);

    const sectorGroup = new THREE.Group();
    this.scene.add(sectorGroup);

    for (const r of sectorRects) {
      const sec = this.secById[r.ref];
      const geo = new THREE.PlaneGeometry(r.w, r.h);
      const mat = new THREE.MeshBasicMaterial({
        color: sec.color,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(r.x + r.w / 2, 0, r.y + r.h / 2);
      sectorGroup.add(mesh);
      this.track(mesh);

      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: sec.color, transparent: true, opacity: 0.55 });
      const edge = new THREE.LineSegments(edgeGeo, edgeMat);
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(r.x + r.w / 2, 0.02, r.y + r.h / 2);
      sectorGroup.add(edge);
      this.track(edge);

      if (Math.min(r.w, r.h) > 6) {
        const label = this.makeLabel(sec.name, '#e5e7eb');
        label.position.set(r.x + r.w / 2, 0.1, r.y + r.h / 2);
        label.scale.set(Math.min(r.w * 0.5, 10), Math.min(r.w * 0.5, 10) * 0.18, 1);
        (label.material as THREE.SpriteMaterial).opacity = 0.18;
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

  /** glTF variant scaled to the treemap cell; tinted by return color. */
  private buildGltfStockBuildingContent(group: THREE.Group, r: StockRect, st: StockRow) {
    this.clearBuildingGroup(group);
    const sec = this.secById[st.s];
    const { footW, footD } = lotFootprint(r);
    const H = computeTowerHeight(st);
    const seed = tickerStyleSeed(st.t);
    const bodyColor = colorForReturn(st);

    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x2a3142,
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
    applySectorMaterial(group, sec.name);
    addLogoSprite(group, st.t);

    group.userData.stock = st;
    group.userData.rect = r;
    group.userData.baseColor = bodyColor;
    group.userData.sectorColor = sec.color;
  }

  /** Stacked “tycoon” building: slab, podium, shaft, setback crown, roof, optional spire. */
  private buildProceduralStockBuildingContent(group: THREE.Group, r: StockRect, st: StockRow) {
    this.clearBuildingGroup(group);
    const sec = this.secById[st.s];
    const { footW, footD } = lotFootprint(r);
    const H = computeTowerHeight(st);
    const seed = tickerStyleSeed(st.t);
    const bodyColor = colorForReturn(st);
    const secCol = new THREE.Color(sec.color);

    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x2a3142,
      roughness: 0.88,
      metalness: 0.04,
    });
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.48,
      metalness: 0.06,
      emissive: bodyColor.clone().multiplyScalar(0.07),
    });

    let yTop = 0;

    const slabT = 0.1;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(footW, slabT, footD), podiumMat);
    slab.position.y = yTop + slabT / 2;
    group.add(slab);
    yTop += slabT;

    const podH = Math.min(H * 0.22, Math.max(0.2, H * 0.18));
    const podScale = 0.94 - (seed % 7) * 0.008;
    const podium = new THREE.Mesh(new THREE.BoxGeometry(footW * podScale, podH, footD * podScale), podiumMat);
    podium.position.y = yTop + podH / 2;
    group.add(podium);
    yTop += podH;

    const shaftFrac = 0.58 + (seed % 5) * 0.04;
    const shaftH = Math.max(0.25, H * shaftFrac);
    const inset = 0.72 + (seed % 11) * 0.01;
    const shaftW = footW * inset;
    const shaftD = footD * inset;
    const shaftGeo = new THREE.BoxGeometry(shaftW, shaftH, shaftD);
    const shaft = new THREE.Mesh(shaftGeo, bodyMat);
    shaft.position.y = yTop + shaftH / 2;
    group.add(shaft);

    const edgeGeo = new THREE.EdgesGeometry(shaftGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.14,
    });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    edges.position.copy(shaft.position);
    group.add(edges);
    yTop += shaftH;

    const crownH = Math.min(H * 0.22, 1.25);
    const useSetback = H > 1.4 && seed % 3 !== 0;
    if (useSetback && crownH > 0.15) {
      const crownInset = inset * 0.82;
      const crown = new THREE.Mesh(
        new THREE.BoxGeometry(footW * crownInset, crownH, footD * crownInset),
        bodyMat,
      );
      crown.position.y = yTop + crownH / 2;
      group.add(crown);
      yTop += crownH;
    }

    const roofR = Math.min(footW, footD) * 0.22;
    const roofH = Math.min(0.55, roofR * 1.2);
    const coneH = roofH * 1.35;
    const pyrH = roofH * 1.15;
    const roofGeo =
      seed % 2 === 0 ? new THREE.ConeGeometry(roofR, coneH, 4) : new THREE.CylinderGeometry(0, roofR * 0.95, pyrH, 4);
    const roofActualH = seed % 2 === 0 ? coneH : pyrH;
    const roofMat = new THREE.MeshStandardMaterial({
      color: secCol,
      roughness: 0.35,
      metalness: 0.25,
      emissive: secCol.clone().multiplyScalar(0.12),
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = yTop + roofActualH / 2;
    roof.rotation.y = 0;
    group.add(roof);
    yTop += roofActualH;

    if (H > 4.2 && seed % 4 !== 1) {
      const spireH = Math.min(1.8, H * 0.12);
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.09, spireH, 6),
        new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.25,
          metalness: 0.5,
          emissive: new THREE.Color(0x94a3b8).multiplyScalar(0.15),
        }),
      );
      spire.position.y = yTop + spireH / 2;
      group.add(spire);
    }

    applySectorMaterial(group, sec.name);
    addLogoSprite(group, st.t);

    group.userData.stock = st;
    group.userData.rect = r;
    group.userData.baseColor = bodyColor;
    group.userData.sectorColor = sec.color;
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

  animateCamera(mode: '3d' | 'top' | 'front') {
    const target =
      mode === '3d'
        ? { x: 0, y: 50, z: 70 }
        : mode === 'top'
          ? { x: 0, y: 85, z: 0.001 }
          : { x: 0, y: 14, z: 70 };
    if (this.camAnim) cancelAnimationFrame(this.camAnim);
    const start = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };
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
      this.controls.target.set(0, 0, 0);
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
    const t0 = performance.now();
    const startY = 130;
    const endY = 50;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1200);
      const e = 1 - Math.pow(1 - k, 3);
      this.camera.position.y = startY + (endY - startY) * e;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  getSector(id: string) {
    return this.secById[id];
  }
}
