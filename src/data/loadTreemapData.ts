import type { SectorDef, StockRow, TreemapDataFile } from '../types';
import treemapData from './treemap_data.json';

export function loadTreemapData(): {
  sectors: SectorDef[];
  stocks: StockRow[];
  generatedAt: string;
} {
  const data = treemapData as TreemapDataFile;
  const stocks: StockRow[] = data.stocks.map((row) => ({ ...row }));
  const snap = data.generated_at;
  for (const st of stocks) {
    if (st.source == null) st.source = 'mock';
    if (st.sourceLabel == null) st.sourceLabel = '데모 데이터';
    if (st.asOf == null) st.asOf = snap;
  }
  return { sectors: data.sectors, stocks, generatedAt: snap };
}
