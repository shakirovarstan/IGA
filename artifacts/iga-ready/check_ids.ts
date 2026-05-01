import { readFileSync } from 'fs';

const content = readFileSync('artifacts/iga-ready/src/data/questions.ts', 'utf8');
const ids = [...content.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
if (duplicates.length) {
  console.log('Duplicates found:', [...new Set(duplicates)]);
} else {
  console.log('No duplicates.');
}
