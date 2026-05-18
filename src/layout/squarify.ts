import type { StockRow } from '../types';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RectWithRef<T> extends Rect {
  ref: T;
}

/** Simplified squarify (row-based), matching prototype behavior */
export function squarify<T>(items: { value: number; ref: T }[], x: number, y: number, w: number, h: number): RectWithRef<T>[] {
  const total = items.reduce((a, b) => a + b.value, 0);
  const out: RectWithRef<T>[] = [];
  const cur: Rect = { x, y, w, h };
  let row: { value: number; ref: T }[] = [];
  let rowVal = 0;

  function worst(rowIn: typeof row, length: number, sumV: number, totalIn: number, area: number) {
    const scale = area / totalIn;
    const rs = sumV * scale;
    const w2 = rs / length;
    let maxAR = 0;
    for (const it of rowIn) {
      const a = it.value * scale;
      const h2 = a / w2;
      maxAR = Math.max(maxAR, Math.max(w2 / h2, h2 / w2));
    }
    return maxAR;
  }

  function layoutRow(rowIn: typeof row, curIn: Rect, sumV: number, remainingTotal: number) {
    const horizontal = curIn.w >= curIn.h;
    const area = curIn.w * curIn.h;
    const scale = area / remainingTotal;
    const rs = sumV * scale;
    if (horizontal) {
      const rh = rs / curIn.w;
      let cx = curIn.x;
      for (const it of rowIn) {
        const a = it.value * scale;
        const rw = a / rh;
        out.push({ ref: it.ref, x: cx, y: curIn.y, w: rw, h: rh });
        cx += rw;
      }
      curIn.y += rh;
      curIn.h -= rh;
    } else {
      const rw = rs / curIn.h;
      let cy = curIn.y;
      for (const it of rowIn) {
        const a = it.value * scale;
        const rh = a / rw;
        out.push({ ref: it.ref, x: curIn.x, y: cy, w: rw, h: rh });
        cy += rh;
      }
      curIn.x += rw;
      curIn.w -= rw;
    }
  }

  const sorted = [...items].sort((a, b) => b.value - a.value);
  let remainingTotal = total;
  for (let i = 0; i < sorted.length; i++) {
    const it = sorted[i];
    const horizontal = cur.w >= cur.h;
    const side = horizontal ? cur.w : cur.h;
    const newRow = [...row, it];
    const newSum = rowVal + it.value;
    const area = cur.w * cur.h;
    const wPrev = row.length ? worst(row, side, rowVal, remainingTotal, area) : Infinity;
    const wNew = worst(newRow, side, newSum, remainingTotal, area);
    if (row.length === 0 || wNew <= wPrev) {
      row = newRow;
      rowVal = newSum;
    } else {
      layoutRow(row, cur, rowVal, remainingTotal);
      remainingTotal -= rowVal;
      row = [it];
      rowVal = it.value;
    }
  }
  if (row.length) layoutRow(row, cur, rowVal, remainingTotal);
  return out;
}

export interface StockRect extends RectWithRef<StockRow> {
  sectorRect: RectWithRef<string>;
}

export function computeLayout(stocks: StockRow[], W: number, H: number): { sectorRects: RectWithRef<string>[]; stockRects: StockRect[] } {
  const bySec: Record<string, StockRow[]> = {};
  for (const st of stocks) {
    (bySec[st.s] ??= []).push(st);
  }
  const sectorItems = Object.keys(bySec).map((id) => ({
    value: bySec[id].reduce((a, b) => a + (b.cap || 0), 0),
    ref: id,
  }));
  const secRects = squarify(sectorItems, -W / 2, -H / 2, W, H);

  const stockRects: StockRect[] = [];
  for (const r of secRects) {
    const pad = 0.8;
    const innerX = r.x + pad;
    const innerY = r.y + pad;
    const innerW = Math.max(0.1, r.w - pad * 2);
    const innerH = Math.max(0.1, r.h - pad * 2);
    const sectStocks = bySec[r.ref];
    const items = sectStocks.map((s) => ({ value: s.cap, ref: s }));
    const inside = squarify(items, innerX, innerY, innerW, innerH);
    for (const ins of inside) {
      stockRects.push({ ...ins, sectorRect: r });
    }
  }
  return { sectorRects: secRects, stockRects };
}
