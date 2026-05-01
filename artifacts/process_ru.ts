import fs from 'fs';
import path from 'path';

const questions = JSON.parse(fs.readFileSync('artifacts/ru_questions.json', 'utf8'));
const topicsFile = 'artifacts/iga-ready/src/data/topics.ts';
const questionsFile = 'artifacts/iga-ready/src/data/questions.ts';

let topicsCode = fs.readFileSync(topicsFile, 'utf8');
let qCode = fs.readFileSync(questionsFile, 'utf8');

// The new topics to add
const newTopicsData: Record<string, {ru: string, ky: string}> = {
  comma: { ru: 'Запятые в сложных предложениях', ky: 'Татаал сүйлөмдөрдөгү үтүрлөр' },
  intro: { ru: 'Вводные слова', ky: 'Кириш сөздөр' },
  appeal: { ru: 'Обращения', ky: 'Кайрылуулар' },
  participle: { ru: 'Причастный оборот', ky: 'Атоочтук түрмөк' },
  gerund: { ru: 'Деепричастный оборот', ky: 'Чакчыл түрмөк' },
  dash: { ru: 'Тире между подлежащим и сказуемым', ky: 'Ээ менен баяндоочтун ортосундагы сызыкча' },
  colon: { ru: 'Двоеточие в БСП', ky: 'БСПдагы кош чекит' },
  spelling_n_n: { ru: 'Н / НН', ky: 'Н / НН' },
  spelling_not: { ru: 'НЕ слитно и раздельно', ky: 'НЕ бирге жана бөлөк' },
  roots: { ru: 'Чередующиеся корни', ky: 'Кезектешкен уңгулар' },
  prefixes: { ru: 'Приставки ПРЕ / ПРИ', ky: 'ПРЕ / ПРИ мүчөлөрү' },
  conjunctions: { ru: 'Союзы', ky: 'Байламталар' },
  styles: { ru: 'Стили речи', ky: 'Стиль түрлөрү' },
  types_clause: { ru: 'Виды придаточных', ky: 'Багыныңкы сүйлөмдөрдүн түрлөрү' },
  punct_participle: { ru: 'Запятые при причастном обороте', ky: 'Атоочтук түрмөктөгү үтүрлөр' },
  punct_gerund: { ru: 'Запятые при деепричастном обороте', ky: 'Чакчыл түрмөктөгү үтүрлөр' },
  homogeneous: { ru: 'Однородные члены предложения', ky: 'Сүйлөмдүн бир өңчөй мүчөлөрү' },
  complex_mix: { ru: 'Смешанные сложные конструкции', ky: 'Аралаш татаал конструкциялар' },
  syntax_base: { ru: 'Грамматическая основа', ky: 'Грамматикалык негиз' }
};

let topicMapping: Record<string, string> = {
  spp: 'complex_sentences',
  ssp: 'compound_sentences',
  bsp: 'asyndeton',
  direct_speech: 'direct_speech',
  lexical: 'lexicology',
  ortho: 'orthography'
};

const newTopicsStr: string[] = [];

for (const [key, value] of Object.entries(newTopicsData)) {
  const newId = 'ru_' + key;
  topicMapping[key] = newId;

  // if not exists
  if (topicsCode.indexOf(`id: '${newId}'`) === -1) {
    newTopicsStr.push(`  {
    id: '${newId}',
    subject: 'russian',
    title: { ru: '${value.ru}', ky: '${value.ky}' },
    whatIsIt: { ru: '${value.ru}', ky: '${value.ky}' },
    formula: { title: { ru: 'Правило', ky: 'Эреже' }, math: '${value.ru}' },
    example: { problem: { ru: 'Пример задания', ky: 'Мисал' }, steps: [{ step: 'Решение', math: '' }], answer: 'Ответ' },
    commonMistakes: { ru: [], ky: [] }
  }`);
  }
}

if (newTopicsStr.length > 0) {
  // insert before `];`
  topicsCode = topicsCode.replace(/\n\];?\s*$/, ',\n' + newTopicsStr.join(',\n') + '\n];\n');
  fs.writeFileSync(topicsFile, topicsCode);
}

// Generate questions
let idCounter = 1;
const formattedQuestions = questions.map((q: any) => {
  const topicId = topicMapping[q.topic] || ('ru_' + q.topic);
  
  while(q.options.length < 4) q.options.push("вариант " + (q.options.length + 1));
  
  return {
    id: `ru-hard-${idCounter++}`,
    subject: 'russian',
    part: 1,
    topic: topicId,
    text: { ru: q.question, ky: q.question },
    options: [
      { id: 'a', text: String(q.options[0]) },
      { id: 'b', text: String(q.options[1]) },
      { id: 'c', text: String(q.options[2]) },
      { id: 'd', text: String(q.options[3]) }
    ],
    correctAnswer: 'a',
    solution: { ru: [q.explanation || ''], ky: [q.explanation || ''] }
  };
});

questions.forEach((q: any, i: number) => {
  let ansIdx = q.options.indexOf(q.answer);
  if (ansIdx === -1) ansIdx = 0;
  const letters = ['a', 'b', 'c', 'd'];
  formattedQuestions[i].correctAnswer = letters[ansIdx];
});

let exportString = "export const MORE_RUSSIAN_QUESTIONS: any[] = " + JSON.stringify(formattedQuestions, null, 2) + ";\n";

if(qCode.indexOf('MORE_RUSSIAN_QUESTIONS') !== -1) {
  qCode = qCode.replace(/export const MORE_RUSSIAN_QUESTIONS[\s\S]*?;/g, '');
  qCode = qCode.replace(', ...MORE_RUSSIAN_QUESTIONS', '');
}

qCode = qCode.replace('export const ALL_QUESTIONS = ', exportString + "\nexport const ALL_QUESTIONS = ");
qCode = qCode.replace('...RUSSIAN_QUESTIONS', '...RUSSIAN_QUESTIONS, ...MORE_RUSSIAN_QUESTIONS');

fs.writeFileSync(questionsFile, qCode);
console.log(`Added ${formattedQuestions.length} Russian questions and ${newTopicsStr.length} topics!`);
