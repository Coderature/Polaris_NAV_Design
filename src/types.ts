export type MarketCode = 'US' | 'KR';

export interface SectorDef {
  id: string;
  name: string;
  ko: string;
  color: string;
}

export interface StockRow {
  t: string;
  n: string;
  m: MarketCode;
  s: string;
  /** Market cap in billions USD */
  cap: number;
  per: number | null;
  pbr: number | null;
  /** Volume in millions */
  vol: number;
  div: number;
  halted?: boolean;
  /** Runtime: daily change % */
  chg?: number;
  /** Runtime: simulated price */
  price?: number;
}

export interface TreemapDataFile {
  schema_version: string;
  /** ISO timestamp of the market snapshot in this file (chg / price). */
  generated_at: string;
  sectors: SectorDef[];
  /** Static fields + optional same-day `chg` (%) and `price` loaded on entry. */
  stocks: (Omit<StockRow, 'chg' | 'price'> & Partial<Pick<StockRow, 'chg' | 'price'>>)[];
}
