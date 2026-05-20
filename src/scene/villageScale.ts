/**
 * Unified village layout scale — adjust these together so ground, borders,
 * grid spacing, and building footprints stay aligned.
 *
 * Core bi-proportional targets (1.4× from legacy 1.25 / 1.58):
 *   VILLAGE_CELL_SIZE · VILLAGE_MODEL_SCALE_XZ
 */
export const VILLAGE_GRID_COLS = 4;
export const VILLAGE_GRID_ROWS = 2;

/** Legacy cell ground factor (gx); sector/layout derived at 1.4×. */
export const VILLAGE_CELL_SIZE = 1.75;

/** Per-stock XZ scale applied in DesignScene only (1.4× from legacy 1.58). */
export const VILLAGE_MODEL_SCALE_XZ = 2.2;

/** Alias for prompt/docs. */
export const VILLAGE_MODEL_SCALE = VILLAGE_MODEL_SCALE_XZ;

/** Center-to-center spacing between stock cells (scene units). */
export const VILLAGE_GRID_SPACING = 21;

/** Extra margin around the grid for the green ground plane. */
export const VILLAGE_GROUND_PADDING = 20;

/** Ground plane size multiplier (on top of grid + padding). */
export const VILLAGE_GROUND_AREA_SCALE = 2.41;

/** Sector tile inset from cell edge (fraction of GRID_SPACING). */
export const VILLAGE_SECTOR_INSET = 0.035;

/** Sector border ribbon thickness (world units, 1.4× from 0.22). */
export const VILLAGE_BORDER_WIDTH = 0.31;

/** Sector border ribbon height (world units, 1.4× from 0.028). */
export const VILLAGE_BORDER_HEIGHT = 0.039;

export const VILLAGE_CAMERA_DEFAULT: readonly [number, number, number] = [48, 42, 48];
export const VILLAGE_FOG_NEAR = 59;
export const VILLAGE_FOG_FAR = 168;

export const VILLAGE_ORBIT_MIN_DISTANCE = 42;
export const VILLAGE_ORBIT_MAX_DISTANCE = 280;

export function villageCellSize(): number {
  return VILLAGE_GRID_SPACING * (1 - VILLAGE_SECTOR_INSET * 2);
}

export function villageFloorSize(): { w: number; d: number } {
  const w =
    (VILLAGE_GRID_SPACING * VILLAGE_GRID_COLS + VILLAGE_GROUND_PADDING) * VILLAGE_GROUND_AREA_SCALE;
  const d =
    (VILLAGE_GRID_SPACING * VILLAGE_GRID_ROWS + VILLAGE_GROUND_PADDING) * VILLAGE_GROUND_AREA_SCALE;
  return { w, d };
}
