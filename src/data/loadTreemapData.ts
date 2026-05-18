import type { MarketCode, SectorDef, StockRow, TreemapDataFile } from '../types';

/** Deterministic demo % change per ticker (fallback when JSON has no `chg`). */
function tickerDailyChg(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
  const u = (Math.abs(h) % 10000) / 10000;
  return +((u * 7.5 - 3.25)).toFixed(2);
}

function tickerDemoPrice(t: string, m: MarketCode): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
  const base = 30 + (Math.abs(h) % 970);
  return m === 'KR' ? +(base * 1.2).toFixed(0) : +base.toFixed(2);
}

/** Apply daily change % and price from JSON snapshot, or stable per-ticker fallbacks. */
export function applyMarketSnapshot(stocks: StockRow[]): void {
  for (const st of stocks) {
    if (st.halted) {
      st.chg = 0;
      st.price = 0;
      continue;
    }
    if (st.chg == null) st.chg = tickerDailyChg(st.t);
    if (st.price == null) st.price = tickerDemoPrice(st.t, st.m);
  }
}

/** @deprecated Use applyMarketSnapshot — kept for tests/tools that need a full re-roll. */
export function seedReturns(stocks: StockRow[], seed = 42): void {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (const st of stocks) {
    if (st.halted) {
      st.chg = 0;
      st.price = 0;
      continue;
    }
    const r = (rand() - 0.45) * 0.08;
    st.chg = +(r * 100).toFixed(2);
    st.price = +(50 + rand() * 950).toFixed(2);
  }
}

export async function loadTreemapData(): Promise<{
  sectors: SectorDef[];
  stocks: StockRow[];
  generatedAt: string;
}> {
  const res = await fetch('/treemap_data.json');
  if (!res.ok) throw new Error(`시장 데이터를 불러오지 못했습니다 (${res.status})`);
  const data = (await res.json()) as TreemapDataFile;
  const stocks: StockRow[] = data.stocks.map((row) => ({ ...row }));
  applyMarketSnapshot(stocks);
  const snap = data.generated_at;
  for (const st of stocks) {
    if (st.source == null) st.source = 'mock';
    if (st.sourceLabel == null) st.sourceLabel = '데모 데이터';
    if (st.asOf == null) st.asOf = snap;
  }
  return { sectors: data.sectors, stocks, generatedAt: snap };
}
