import { readFileSync } from 'fs';

const questionsStr = readFileSync('artifacts/iga-ready/src/data/questions.ts', 'utf8');
const topicsStr = readFileSync('artifacts/iga-ready/src/data/topics.ts', 'utf8');

const tIds = [...topicsStr.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
const qTopics = [...questionsStr.matchAll(/topic:\s*'([^']+)'/g)].map(m => m[1]);

const missing = [...new Set(qTopics)].filter(t => !tIds.includes(t));
console.log('Missing topics:', missing);
