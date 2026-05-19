import * as THREE from 'three';

// ── helpers ───────────────────────────────────────────────────────────────────
function mat(hex: number, roughness = 0.65, metalness = 0.1): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: hex, roughness, metalness });
}

// py = bottom Y of the shape
function bx(w: number, h: number, d: number, m: THREE.Material, px = 0, py = 0, pz = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.position.set(px, py + h / 2, pz);
  return mesh;
}

// py = bottom Y of the cylinder
function cy(r: number, h: number, m: THREE.Material, px = 0, py = 0, pz = 0, segs = 10): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r, h, segs), m);
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.position.set(px, py + h / 2, pz);
  return mesh;
}

function grp(...parts: THREE.Object3D[]): THREE.Group {
  const g = new THREE.Group();
  parts.forEach(p => g.add(p));
  return g;
}

// ── Boeing: aerospace hangar complex ─────────────────────────────────────────
export function createBoeing(): THREE.Group {
  const conc  = mat(0xb2bcc8);
  const steel = mat(0x7a8fa0, 0.45, 0.35);
  const glass = mat(0x3a6a9a, 0.12, 0.05);
  const dark  = mat(0x3a3a3a, 0.85);
  return grp(
    bx(4.0, 0.2,  3.5, mat(0x8a96a8), 0,     0,    0),    // foundation slab
    bx(3.6, 2.4,  3.0, conc,          0,     0.2,  0),    // hangar body
    bx(3.6, 0.18, 3.0, steel,         0,     2.6,  0),    // roof
    bx(1.3, 1.6,  1.9, conc,          -2.45, 0.2,  0),    // side annex
    bx(1.3, 0.15, 1.9, steel,         -2.45, 1.8,  0),    // annex roof
    bx(3.4, 0.22, 0.05, glass,        0,     1.55, 1.53), // window band hi
    bx(3.4, 0.22, 0.05, glass,        0,     0.80, 1.53), // window band lo
    bx(0.45, 3.0, 0.45, conc,         1.7,   0,    0.9),  // control tower
    bx(0.75, 0.28, 0.75, glass,       1.7,   3.0,  0.9),  // tower cab
    cy(0.11, 1.1, dark,               -0.9,  2.6,  -0.6, 6), // stack 1
    cy(0.09, 0.9, dark,               -1.35, 2.6,   0.3, 6), // stack 2
  );
}

// ── Exxon Mobil: oil refinery ─────────────────────────────────────────────────
export function createExxonMobil(): THREE.Group {
  const pad   = mat(0x585c66, 0.85);
  const tank  = mat(0xc0b090, 0.55, 0.2);
  const bldg  = mat(0x8a7a6a);
  const pipe  = mat(0x484848, 0.7, 0.3);
  const flame = mat(0xdd3a10, 0.55);
  return grp(
    bx(4.0, 0.25, 4.0, pad,            0,     0,    0),   // base pad
    bx(2.0, 1.8,  2.0, bldg,          -0.6,   0.25, 0),   // process building
    bx(2.0, 0.18, 2.0, pipe,          -0.6,   2.05, 0),   // building roof
    cy(0.75, 1.4, tank,                1.3,   0.25, -0.5, 12), // storage tank A
    cy(0.55, 1.1, tank,                1.3,   0.25,  0.9, 12), // storage tank B
    bx(0.22, 0.22, 0.22, tank,         1.3,   1.65, -0.5),    // dome A
    bx(0.18, 0.18, 0.18, tank,         1.3,   1.35,  0.9),    // dome B
    cy(0.12, 3.8, pipe,               -1.55,  0.25,  0,   6), // main flare stack
    cy(0.09, 2.8, pipe,               -1.85,  0.25,  0.6, 6), // stack 2
    bx(0.2, 0.2,  0.2, flame,         -1.55,  4.05,  0),      // flare flame
    bx(2.5, 0.12, 0.22, pipe,          0.2,   1.2,   0),      // horizontal pipe
  );
}

// ── Samsung Electronics: glass tech tower ────────────────────────────────────
export function createSamsungFab(): THREE.Group {
  const base  = mat(0x2a3a5a, 0.7);
  const glass = mat(0x4a7aaa, 0.08, 0.2);
  const lite  = mat(0x8ab4d8, 0.08, 0.15);
  const acc   = mat(0x0f1e38, 0.5, 0.3);
  return grp(
    bx(3.2, 0.4,  3.2, base,  0, 0),    // podium
    bx(2.6, 0.55, 2.6, acc,   0, 0.4),  // podium top step
    bx(2.0, 3.2,  2.0, glass, 0, 0.95), // tower lower
    bx(1.6, 1.8,  1.6, lite,  0, 4.15), // tower upper
    bx(1.0, 0.9,  1.0, glass, 0, 5.95), // crown
    cy(0.06, 1.3, acc,         0, 6.85), // antenna
    bx(2.0, 0.07, 0.05, acc,  0, 1.9, 1.02), // win band 1
    bx(2.0, 0.07, 0.05, acc,  0, 2.6, 1.02), // win band 2
    bx(2.0, 0.07, 0.05, acc,  0, 3.3, 1.02), // win band 3
    bx(2.0, 0.07, 0.05, acc,  0, 4.0, 1.02), // win band 4
  );
}

// ── S-Oil: compact oil refinery ──────────────────────────────────────────────
export function createSOilRefinery(): THREE.Group {
  const pad    = mat(0x545048, 0.85);
  const vessel = mat(0xc8b888, 0.5, 0.25);
  const pipe   = mat(0x404040, 0.75, 0.25);
  const bldg   = mat(0x8a8060);
  return grp(
    bx(3.8, 0.22, 3.8, pad,            0,    0,    0),    // platform
    bx(1.6, 1.4,  1.6, bldg,          -0.8,  0.22, 0),    // main building
    cy(0.65, 2.0, vessel,              1.0,   0.22, -0.65, 12), // big vessel
    cy(0.45, 2.4, vessel,              1.0,   0.22,  0.75, 12), // tall vessel
    bx(0.2,  0.2, 0.2,  vessel,        1.0,   2.22, -0.65), // dome A
    bx(0.15, 0.15, 0.15, vessel,       1.0,   2.62,  0.75), // dome B
    cy(0.11, 2.8, pipe,               -1.65,  0.22,  0,   6), // stack A
    cy(0.09, 2.2, pipe,               -1.9,   0.22,  0.55, 6), // stack B
    bx(1.8, 0.12, 0.18, pipe,          0,     1.1,   0),   // cross pipe
  );
}

// ── LG Energy Solution: battery factory ──────────────────────────────────────
export function createLGEnergySolution(): THREE.Group {
  const wall = mat(0xd0d8e0);
  const roof = mat(0x3a5a7a, 0.6, 0.15);
  const glass = mat(0x2a5a8a, 0.1, 0.12);
  const dark = mat(0x1a2a3a);
  const lgRed = mat(0xcc0000, 0.45, 0.05);
  return grp(
    bx(4.2, 0.2,  3.8, mat(0x6a7a8a), 0,     0,    0),   // slab
    bx(4.0, 2.0,  3.6, wall,          0,     0.2,  0),   // factory body
    bx(4.0, 0.2,  3.6, roof,          0,     2.2,  0),   // main roof
    bx(1.6, 1.2,  1.5, mat(0xc0c8d4), -1.0,  0.2,  1.1), // front annex
    bx(1.6, 0.18, 1.5, dark,          -1.0,  1.4,  1.1), // annex roof
    bx(4.0, 0.28, 0.05, glass,         0,    1.15, 1.82), // window hi
    bx(4.0, 0.28, 0.05, glass,         0,    0.55, 1.82), // window lo
    bx(0.55, 0.08, 3.6, lgRed,         1.75,  2.2,  0),   // roof rail R
    bx(0.55, 0.08, 3.6, lgRed,        -1.75,  2.2,  0),   // roof rail L
    cy(0.11, 1.0, dark,                1.3,   2.4,  -0.8, 6), // vent A
    cy(0.11, 1.0, dark,                1.3,   2.4,   0.8, 6), // vent B
  );
}

// ── Hyundai Motor: auto assembly plant ───────────────────────────────────────
export function createHyundaiMotor(): THREE.Group {
  const body   = mat(0xa8b8c0);
  const roof   = mat(0x607080, 0.55, 0.2);
  const dark   = mat(0x384858);
  const glass  = mat(0x4a90b4, 0.1);
  const blue   = mat(0x003087, 0.4, 0.1); // Hyundai blue
  return grp(
    bx(4.2, 0.18, 3.8, mat(0x707888), 0,     0,    0),   // base
    bx(4.0, 1.8,  3.5, body,          0,     0.18, 0),   // main hall
    bx(4.0, 0.22, 3.5, roof,          0,     1.98, 0),   // roof A
    bx(1.6, 0.75, 3.5, body,         -2.9,   0.18, 0),   // side ext
    bx(1.6, 0.15, 3.5, roof,         -2.9,   0.93, 0),   // side roof
    bx(1.5, 1.2,  1.0, mat(0xb8c8d0), 1.2,   0.18, 1.3), // office block
    bx(1.5, 0.18, 1.0, dark,          1.2,   1.38, 1.3), // office roof
    bx(1.5, 0.35, 0.05, glass,        1.2,   0.75, 1.81), // office window
    bx(3.8, 0.3,  0.06, blue,         0,     1.0,  1.77), // blue accent stripe
    cy(0.14, 2.5, dark,              -1.0,   1.98, -0.5, 6), // chimney A
    cy(0.14, 2.5, dark,               0.4,   1.98, -0.5, 6), // chimney B
    cy(0.12, 2.0, dark,               1.5,   1.98, -0.5, 6), // chimney C
  );
}

// ── Samsung Biologics: pharma lab campus ─────────────────────────────────────
export function createSamsungBiologics(): THREE.Group {
  const white = mat(0xf0f4f8, 0.45, 0.05);
  const bglass = mat(0x4a90c4, 0.08, 0.12);
  const gray  = mat(0xbcc8d4, 0.6);
  const acc   = mat(0x1a5a9a, 0.4, 0.1);
  return grp(
    bx(3.5, 0.3,  3.5, gray,          0,     0,    0),   // base slab
    bx(3.0, 2.2,  3.0, white,         0,     0.3,  0),   // main lab block
    bx(3.0, 0.2,  3.0, gray,          0,     2.5,  0),   // roof
    bx(1.2, 1.4,  3.0, bglass,       -2.1,   0.3,  0),   // glass wing
    bx(1.2, 0.18, 3.0, acc,          -2.1,   1.7,  0),   // wing roof
    bx(3.0, 0.28, 0.05, bglass,       0,     1.55, 1.52), // window hi
    bx(3.0, 0.28, 0.05, bglass,       0,     0.8,  1.52), // window lo
    cy(0.55, 0.45, gray,              1.0,   2.7,  0,   16), // dome mech
    cy(0.38, 0.35, white,             1.0,   3.15, 0,   16), // dome top
    bx(0.25, 0.06, 3.0, acc,         -2.1,   1.45, 1.52), // wing win accent
  );
}

// ── Tesla: Gigafactory ────────────────────────────────────────────────────────
export function createTesla(): THREE.Group {
  const solar  = mat(0x1a1a2a, 0.15, 0.7);
  const body   = mat(0xd0d8e0);
  const trim   = mat(0x3a3a3a, 0.7, 0.2);
  const red    = mat(0xcc2200, 0.45, 0.1);
  const roof   = mat(0x505058, 0.6, 0.15);
  return grp(
    bx(4.5, 0.15, 4.0, mat(0x686e70), 0,     0,    0),   // slab
    bx(4.2, 1.5,  3.8, body,          0,     0.15, 0),   // main factory
    bx(4.2, 0.1,  3.8, roof,          0,     1.65, 0),   // roof base
    bx(4.2, 0.08, 3.8, solar,         0,     1.75, 0),   // solar panels
    bx(2.2, 0.85, 2.0, body,         -0.8,   0.15, -3.0), // rear block
    bx(2.2, 0.08, 2.0, solar,        -0.8,   1.0,  -3.0), // rear solar
    bx(4.2, 0.3,  0.06, red,          0,     0.75, 1.92), // red stripe
    cy(0.22, 0.4, trim,               0.6,   1.83,  0.6, 6), // vent A
    cy(0.22, 0.4, trim,              -0.6,   1.83,  0.6, 6), // vent B
    cy(0.22, 0.4, trim,               0.6,   1.83, -0.6, 6), // vent C
    cy(0.22, 0.4, trim,              -0.6,   1.83, -0.6, 6), // vent D
  );
}

// ── Apple Campus: ring HQ ─────────────────────────────────────────────────────
export function createAppleCampus(): THREE.Group {
  const white = mat(0xf2f2f0, 0.25, 0.05);
  const glass = mat(0xaaccee, 0.05, 0.12);
  const dark  = mat(0x1a1a1a, 0.5, 0.2);
  const green = mat(0x3a9a3a, 0.8);
  const floor = mat(0xd0d0c8, 0.7);
  return grp(
    bx(4.2, 0.18, 4.2, floor,         0,    0,    0),    // ground
    // ring walls (side panels span full Z; front/back fit between)
    bx(0.55, 1.8, 4.2, white,         1.7,  0.18, 0),    // right arc
    bx(0.55, 1.8, 4.2, white,        -1.7,  0.18, 0),    // left arc
    bx(2.9,  1.8, 0.55, white,        0,    0.18, 1.7),  // front arc
    bx(2.9,  1.8, 0.55, white,        0,    0.18, -1.7), // back arc
    bx(4.2,  0.18, 4.2, glass,        0,    1.98, 0),    // glass roof
    bx(2.2,  0.5,  2.2, green,        0,    0.18, 0),    // inner courtyard
    cy(0.62, 0.5, dark,               0,    2.16, 0,  8), // roof cap
    bx(1.2,  0.08, 0.65, glass,       0,    1.22, 2.1),  // entrance canopy
  );
}

// ── Amazon: fulfillment warehouse ─────────────────────────────────────────────
export function createAmazonWarehouse(): THREE.Group {
  const body   = mat(0xd8c8a0);
  const roof   = mat(0x888070, 0.6);
  const orange = mat(0xff9900, 0.45, 0.05);
  const dark   = mat(0x3a3028, 0.75);
  const parapet = mat(0x706850, 0.6);
  return grp(
    bx(4.5, 0.15, 4.0, mat(0x686050), 0,     0,    0),   // slab
    bx(4.2, 2.0,  3.8, body,          0,     0.15, 0),   // warehouse
    bx(4.2, 0.2,  3.8, roof,          0,     2.15, 0),   // flat roof
    bx(4.2, 0.14, 3.8, parapet,       0,     2.35, 0),   // parapet
    bx(4.2, 0.38, 0.06, orange,       0,     1.3,  1.92), // orange stripe
    bx(0.65, 0.75, 0.65, dark,       -1.5,   0.15, 2.05), // dock A
    bx(0.65, 0.75, 0.65, dark,        0,     0.15, 2.05), // dock B
    bx(0.65, 0.75, 0.65, dark,        1.5,   0.15, 2.05), // dock C
    bx(1.2, 1.1,  0.85, mat(0xc8b890), 1.5,  0.15, -3.0), // office block
    bx(1.2, 0.18, 0.85, dark,          1.5,  1.25, -3.0), // office roof
    cy(0.16, 0.55, dark,               0.5,  2.35,  0.5, 6), // vent A
    cy(0.16, 0.55, dark,              -0.5,  2.35, -0.5, 6), // vent B
  );
}

// ── Google: colorful tech campus ─────────────────────────────────────────────
export function createGoogleDC(): THREE.Group {
  const white  = mat(0xf0f0ec, 0.35);
  const gBlue  = mat(0x4285f4, 0.3, 0.06);
  const gRed   = mat(0xea4335, 0.35, 0.05);
  const gYel   = mat(0xfbbc04, 0.35, 0.05);
  const gGrn   = mat(0x34a853, 0.35, 0.05);
  const conn   = mat(0x90c8f0, 0.1, 0.1);
  const dark   = mat(0x282828, 0.5);
  return grp(
    bx(4.4, 0.18, 4.4, mat(0xd0d8cc),  0,    0,    0),   // campus ground
    bx(2.5, 2.0,  2.0, white,          -0.5,  0.18, 0),   // main office
    bx(2.5, 0.18, 2.0, gBlue,          -0.5,  2.18, 0),   // blue roof
    bx(1.0, 1.2,  1.2, mat(0xdce8fe),  1.65,  0.18, 0.65), // pod A
    bx(1.0, 0.15, 1.2, gRed,           1.65,  1.38, 0.65), // red roof
    bx(1.0, 1.0,  1.2, mat(0xfef9e0),  1.65,  0.18, -0.8), // pod B
    bx(1.0, 0.15, 1.2, gYel,           1.65,  1.18, -0.8), // yellow roof
    bx(1.4, 0.9,  1.0, mat(0xe8f8ec), -1.85,  0.18, 1.0),  // pod C
    bx(1.4, 0.15, 1.0, gGrn,          -1.85,  1.08, 1.0),  // green roof
    bx(0.5, 0.9,  2.2, conn,           0.85,  0.18, 0),    // glass connector
    cy(0.08, 1.5, dark,                0.2,   2.36, 0),    // antenna
  );
}

// ── Bank of America: dark glass finance tower ─────────────────────────────────
export function createBankOfAmerica(): THREE.Group {
  const glass  = mat(0x1a3858, 0.08, 0.35);
  const frame  = mat(0x0a1828, 0.5, 0.45);
  const silver = mat(0x6a8aaa, 0.12, 0.4);
  return grp(
    bx(2.8, 0.3,  2.8, mat(0x1a2838, 0.7, 0.2), 0, 0),   // base
    bx(2.4, 0.55, 2.4, frame,  0, 0.3),  // lobby
    bx(2.0, 4.5,  2.0, glass,  0, 0.85), // tower body
    bx(1.6, 1.2,  1.6, silver, 0, 5.35), // upper setback
    bx(1.0, 0.9,  1.0, glass,  0, 6.55), // crown
    cy(0.06, 1.1, frame, 0, 7.45),       // spire
    bx(2.0, 0.06, 0.05, frame, 0, 1.7,  1.02), // band 1
    bx(2.0, 0.06, 0.05, frame, 0, 2.4,  1.02), // band 2
    bx(2.0, 0.06, 0.05, frame, 0, 3.1,  1.02), // band 3
    bx(2.0, 0.06, 0.05, frame, 0, 3.8,  1.02), // band 4
    bx(2.0, 0.06, 0.05, frame, 0, 4.5,  1.02), // band 5
    bx(2.0, 0.06, 0.05, frame, 0, 5.2,  1.02), // band 6
  );
}

// ── Alibaba: e-commerce HQ ────────────────────────────────────────────────────
export function createAlibaba(): THREE.Group {
  const wall   = mat(0xf0e8d8, 0.45);
  const orange = mat(0xff6a00, 0.38, 0.06);
  const glass  = mat(0x60a0c8, 0.08, 0.12);
  const dark   = mat(0x2a1808, 0.6);
  return grp(
    bx(3.8, 0.22, 3.8, mat(0x7a6a5a), 0,     0,    0),   // base
    bx(3.2, 0.5,  3.2, mat(0xd0c0a0), 0,     0.22, 0),   // podium
    bx(2.4, 2.4,  2.4, wall,          0,     0.72, 0),   // main tower
    bx(2.4, 0.22, 2.4, orange,        0,     3.12, 0),   // orange top band
    bx(1.6, 1.2,  1.6, glass,         0,     3.34, 0),   // upper glass box
    bx(1.6, 0.18, 1.6, dark,          0,     4.54, 0),   // crown
    bx(2.4, 0.32, 0.05, glass,        0,     1.55, 1.22), // win hi
    bx(2.4, 0.32, 0.05, glass,        0,     0.9,  1.22), // win lo
    bx(1.5, 1.8,  0.65, mat(0xe8dcc8),-2.05, 0.22, 0),   // side wing
    bx(1.5, 0.18, 0.65, orange,       -2.05, 2.0,  0),   // wing top
    cy(0.06, 0.9, dark, 0, 4.72),                         // antenna
  );
}

// ── PDD Holdings: modern split-tower office ───────────────────────────────────
export function createPdd(): THREE.Group {
  const wall  = mat(0xe8eef4, 0.38);
  const pBlue = mat(0x2a5aaa, 0.28, 0.12);
  const glass = mat(0x7ab0e0, 0.08, 0.12);
  const dark  = mat(0x1a2a3a, 0.5, 0.2);
  return grp(
    bx(3.5, 0.2,  3.5, mat(0x5a6a7a), 0,    0,    0),   // base
    bx(3.2, 0.45, 3.2, dark,          0,    0.2,  0),   // podium
    bx(2.2, 3.2,  1.8, wall,          0,    0.65, 0),   // main slab tower
    bx(2.2, 0.2,  1.8, pBlue,         0,    3.85, 0),   // top cap
    bx(2.2, 3.2,  0.05, glass,        0,    0.65, 0.92), // glass facade
    bx(1.4, 1.8,  2.2, mat(0xd0dce8), 1.7,  0.65, 0),  // wing tower
    bx(1.4, 0.18, 2.2, pBlue,         1.7,  2.45, 0),  // wing cap
    bx(1.4, 1.8,  0.05, glass,        1.7,  0.65, 1.12), // wing facade
    bx(0.4, 0.08, 1.8, dark,          1.1,  2.63, 0),  // connecting beam
    cy(0.06, 1.0, dark, 0,    4.05),                     // main antenna
    cy(0.06, 0.7, dark, 1.3,  2.63),                     // wing antenna
  );
}
