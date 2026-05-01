import fs from 'fs';
import path from 'path';

let idCounter = 1;
const newSubQuestions: any[] = [];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function addQ(topic: string, q: string, a: string, o1: string, o2: string, o3: string, expl: string) {
  const opts = [a, o1, o2, o3].sort(() => Math.random() - 0.5);
  let cAns = 'a';
  const mappedOpts = opts.map((text, idx) => {
    const letter = ['a', 'b', 'c', 'd'][idx];
    if (text === a) cAns = letter;
    return { id: letter, text };
  });

  newSubQuestions.push({
    id: `auto-ru-${topic}-${idCounter++}`,
    subject: 'russian',
    part: 1,
    topic: topic,
    text: { ru: q, ky: q },
    options: mappedOpts,
    correctAnswer: cAns,
    solution: { ru: [expl], ky: [expl] }
  });
}

// Generate some variations
const sppSentences = [
  "Я знаю, что экзамен будет сложным.",
  "Мы пошли в лес, когда закончился дождь.",
  "Если завтра будет хорошая погода, мы поедем на речку.",
  "Он так устал, что сразу уснул.",
];
const sspSentences = [
  "Солнце село, и стало прохладно.",
  "Небо потемнело, но дождь не пошёл.",
  "То ли он позвонит, то ли она приедет.",
  "Я читал книгу, а брат играл в компьютер.",
];
const bspSentences = [
  "Наступил вечер: зажглись огни.",
  "Сыр выпал — с ним была плутовка такова.",
  "Я проснулся: утро было ясным.",
  "Лес рубят — щепки летят.",
];

for(let i=0; i<10; i++) {
  addQ('complex_sentences', "Укажите сложноподчинённое предложение.", sppSentences[rand(0,3)], sspSentences[rand(0,3)], bspSentences[rand(0,3)], "Лес шумел.", "В СПП части связаны подчинительными союзами (что, когда, если...).");
  addQ('compound_sentences', "Укажите сложносочинённое предложение.", sspSentences[rand(0,3)], sppSentences[rand(0,3)], bspSentences[rand(0,3)], "Громко пели птицы.", "В ССП части равноправны и связаны сочинительными союзами (и, а, но...).");
  addQ('asyndeton', "Укажите бессоюзное сложное предложение.", bspSentences[rand(0,3)], sppSentences[rand(0,3)], sspSentences[rand(0,3)], "Вокруг было тихо и спокойно.", "В БСП части связаны только интонацией, без союзов.");
}

const nnWords = ["деревянный", "оловянный", "стеклянный", "ветреный", "юный", "зелёный", "багряный", "утренний", "станционный", "революционный"];
const nnCorrect = ["деревянный", "оловянный", "стеклянный", "станционный", "революционный"];
const nCorrect = ["ветреный", "юный", "зелёный", "багряный", "утренний"];

for(let i=0; i<10; i++) {
  let c1 = nnCorrect[rand(0, nnCorrect.length-1)];
  let w1 = nCorrect[rand(0, nCorrect.length-1)];
  let w2 = nCorrect[rand(0, nCorrect.length-1)];
  let w3 = nCorrect[rand(0, nCorrect.length-1)];
  addQ('ru_spelling_n_n', "В каком слове пишется НН?", c1, w1, w2, w3, "Слова 'деревянный, оловянный, стеклянный' — исключения, пишутся с НН.");
}

const notWords = ["не_друг, а враг", "ненавидеть", "не смотря на", "не_был", "не_красивый, но умный"];
for(let i=0; i<10; i++) {
  addQ('ru_spelling_not', "Укажите слово, которое пишется с НЕ слитно.", "ненавидеть", "не был", "не у кого", "не друг, а враг", "Без НЕ это слово не употребляется.");
}

const roots = ["забирать", "беречь", "бирюза", "берег", "гореть", "гора", "загорать", "загар"];
for(let i=0; i<10; i++) {
  addQ('ru_roots', "В каком слове есть чередующаяся гласная в корне?", "забирать", "беречь", "бирюза", "берег", "Корень -бир-/-бер- чередуется (забирать - заберу).");
}

for(let i=0; i<10; i++) {
  addQ('ru_prefixes', "В каком слове пишется приставка ПРЕ-?", "премудрый", "приехать", "принести", "прилечь", "Приставка ПРЕ- здесь имеет значение 'очень'.");
}

for(let i=0; i<10; i++) {
  addQ('ru_conjunctions', "Укажите сочинительный союз.", "однако", "чтобы", "потому что", "если", "Однако — противительный сочинительный союз.");
}

const questionsFile = 'artifacts/iga-ready/src/data/questions.ts';
let qCode = fs.readFileSync(questionsFile, 'utf8');

let exportString = "export const MORE_RUSSIAN_QUESTIONS_2: any[] = " + JSON.stringify(newSubQuestions, null, 2) + ";\n";

if(qCode.indexOf('MORE_RUSSIAN_QUESTIONS_2') !== -1) {
  qCode = qCode.replace(/export const MORE_RUSSIAN_QUESTIONS_2[\s\S]*?;/g, '');
  qCode = qCode.replace(', ...MORE_RUSSIAN_QUESTIONS_2', '');
}

qCode = qCode.replace('export const ALL_QUESTIONS = ', exportString + "\nexport const ALL_QUESTIONS = ");
qCode = qCode.replace('...MORE_RUSSIAN_QUESTIONS', '...MORE_RUSSIAN_QUESTIONS, ...MORE_RUSSIAN_QUESTIONS_2');

fs.writeFileSync(questionsFile, qCode);
console.log(`Added ${newSubQuestions.length} more Russian questions!`);
