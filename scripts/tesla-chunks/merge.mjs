import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = new URL('../../public/tesla-business-model-diorama.mjs', import.meta.url);
const parts = ['01.txt', '02.txt', '03.txt', '04.txt', '05.txt'].map((f) =>
  fs.readFileSync(path.join(dir, f), 'utf8'),
);
fs.writeFileSync(out, parts.join(''));
console.log('merged', parts.join('').length, 'chars');
