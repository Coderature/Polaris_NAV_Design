import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const parts = fs.readdirSync(dir)
  .filter((f) => /^part\d+\.html$/.test(f))
  .sort();
const out = parts.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
fs.writeFileSync(path.resolve(dir, '../../public/amazon-business-model-diorama.html'), out);
console.log('parts', parts.length, 'chars', out.length);
