import fs from 'fs';

let idCounter = 1;
const newSubQuestions: any[] = [];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function addQ(subject: string, topic: string, ruText: string, kyText: string, ans: any, optionsArr: any[]) {
  const opts = [...new Set([ans, ...optionsArr])];
  while(opts.length < 4) {
    opts.push(ans + rand(1, 10)); 
  }
  opts.length = 4;
  
  newSubQuestions.push({
    id: `auto-hard-${idCounter++}`,
    subject,
    part: 1,
    topic,
    text: { ru: ruText, ky: kyText },
    options: [
      { id: 'a', text: String(opts[0]) }, 
      { id: 'b', text: String(opts[1]) },
      { id: 'c', text: String(opts[2]) },
      { id: 'd', text: String(opts[3]) }
    ],
    correctAnswer: 'a'
  });
}

// Geometry (200 questions logic)
for(let i=0; i<30; i++) {
  let a = rand(20, 80), b = rand(20, 80);
  addQ('geometry', 'triangle_basics', 
    `В треугольнике два угла равны ${a}° и ${b}°. Найдите третий угол.`, 
    `Үч бурчтуктун эки бурчу ${a}° жана ${b}°. Үчүнчү бурчун тапкыла.`, 
    180-a-b, [180-a-b+10, 180-a-b-10, 180-a-b+20]);
}

for(let i=0; i<20; i++) {
  let ext = rand(100, 160), a = rand(20, ext-20);
  addQ('geometry', 'triangle_basics', 
    `Внешний угол треугольника равен ${ext}°, один из удалённых внутренних углов равен ${a}°. Найдите второй удалённый внутренний угол.`, 
    `Үч бурчтуктун сырткы бурчу ${ext}°, ага чектеш эмес ички бурчтардын бири ${a}°. Экинчи ички бурчту тапкыла.`, 
    ext-a, [ext-a+10, ext-a-10, ext-a+30]);
}

const triples = [[3,4,5], [5,12,13], [8,15,17], [7,24,25], [9,40,41], [11,60,61], [12,35,37], [13,84,85], [16,63,65],[20,21,29]];
for(let i=0; i<25; i++) {
  let t = triples[rand(0, triples.length-1)];
  let k = rand(1, 4); 
  let a = t[0]*k, b = t[1]*k, c = t[2]*k;
  if(rand(0,1)) { let tmp=a; a=b; b=tmp; }
  addQ('geometry', 'pythagorean_theorem', 
    `В прямоугольном треугольнике катеты равны ${a} и ${b}. Найдите гипотенузу.`, 
    `Тик бурчтуу үч бурчтуктун катеттери ${a} жана ${b}. Гипотенузасын тапкыла.`, 
    c, [c+2, c-2, c+4]);
}

for(let i=0; i<30; i++) {
  let a = rand(10, 60), h = rand(6, 30);
  addQ('geometry', 'triangle_area', 
    `Основание треугольника равно ${a}, высота к этому основанию равна ${h}. Найдите площадь треугольника.`, 
    `Үч бурчтуктун негизи ${a}, бул негизге түшүрүлгөн бийиктиги ${h}. Үч бурчтуктун аянтын тапкыла.`, 
    (a*h)/2, [a*h, (a*h)/2 + 5, (a*h)/2 - 10]);
}

for(let i=0; i<20; i++) {
  let k = rand(2, 5);
  let a = rand(3, 15), c = rand(10, 30);
  let b = a * k;
  let d = c * k;
  addQ('geometry', 'similar_triangles', 
    `Два треугольника подобны. Сторона первого треугольника ${a} соответствует стороне второго ${b}. Другая сторона первого равна ${c}. Найдите соответствующую сторону второго.`, 
    `Эки үч бурчтук окшош. Биринчи үч бурчтуктун ${a} жагы экинчисинин ${b} жагына туура келет. Биринчисинин башка жагы ${c}. Экинчисинин тиешелүү жагын тапкыла.`, 
    d, [d+5, d-5, d+10]);
}

for(let i=0; i<20; i++) {
  let r = rand(3, 20);
  if(i%2===0) {
    addQ('geometry', 'circle_basics', 
      `Радиус окружности равен ${r}. Найдите длину окружности.`, 
      `Айлананын радиусу ${r}. Айлананын узундугун тапкыла.`, 
      `${2*r}π`, [`${r*r}π`, `${r}π`, `${2*r}`]);
  } else {
    addQ('geometry', 'circle_basics', 
      `Радиус круга равен ${r}. Найдите площадь круга.`, 
      `Тегеректин радиусу ${r}. Тегеректин аянтын тапкыла.`, 
      `${r*r}π`, [`${2*r}π`, `${r*r}`, `${r*3}π`]);
  }
}

for(let i=0; i<20; i++) {
  let a = rand(20, 89);
  addQ('geometry', 'central_inscribed_angles', 
    `Вписанный угол, опирающийся на дугу, равен ${a}°. Найдите центральный угол, опирающийся на ту же дугу.`, 
    `Жаага таянган ичтен сызылган бурч ${a}°. Ушул эле жаага таянган борбордук бурчту тапкыла.`, 
    `${a*2}°`, [`${a}°`, `${180-a}°`, `${a*2+10}°`]);
}

for(let i=0; i<20; i++) {
  if(i%2===0) {
    let a = rand(10, 40), h = rand(5, 20);
    addQ('geometry', 'parallelogram_area', 
      `Основание параллелограмма равно ${a}, высота к нему равна ${h}. Найдите площадь параллелограмма.`, 
      `Параллелограммдын негизи ${a}, ага түшүрүлгөн бийиктиги ${h}. Параллелограммдын аянтын тапкыла.`, 
      a*h, [a*h/2, a+h, a*h+10]);
  } else {
    let a = rand(10, 30), b = a+rand(4,20), h = rand(6, 18);
    addQ('geometry', 'quadrilaterals', 
      `Основания трапеции равны ${a} и ${b}, высота равна ${h}. Найдите площадь трапеции.`, 
      `Трапециянын негиздери ${a} жана ${b}, бийиктиги ${h}. Трапециянын аянтын тапкыла.`, 
      (a+b)*h/2, [(a+b)*h, a*b*h/2, (a+b)*h/2 + 10]);
  }
}

for(let i=0; i<15; i++) {
  let t = triples[rand(0, triples.length-1)];
  let a = t[0], b = t[1], c = t[2];
  let x1 = rand(-10, 10), y1 = rand(-10, 10);
  let x2 = x1 + (rand(0,1)?a:-a), y2 = y1 + (rand(0,1)?b:-b);
  addQ('geometry', 'distance_between_points',
    `Найдите расстояние между точками A(${x1}; ${y1}) и B(${x2}; ${y2}).`,
    `A(${x1}; ${y1}) жана B(${x2}; ${y2}) чекиттеринин ортосундагы аралыкты тапкыла.`,
    c, [c+2, c-3, c+5]);
}

// Algebra (200 questions logic)
for(let i=0; i<50; i++) {
  let r1 = rand(-15, 15);
  let r2 = rand(-15, 15);
  if(r1 === r2) r2++;
  let b = -(r1+r2), c = r1*r2;
  let bStr = b > 0 ? `+ ${b}` : (b < 0 ? `- ${-b}` : '');
  if(b===1) bStr = '+ ';
  if(b===-1) bStr = '- ';
  let cStr = c > 0 ? `+ ${c}` : (c < 0 ? `- ${-c}` : '');

  addQ('algebra', 'quadratic_equations', 
    `Решите уравнение: x² ${bStr}x ${cStr} = 0`, 
    `Теңдемени чыгаргыла: x² ${bStr}x ${cStr} = 0`, 
    `${Math.min(r1,r2)} и ${Math.max(r1,r2)}`, [`${-r1} и ${-r2}`, `${r1+1} и ${r2+1}`, `нет корней`]);
}

for(let i=0; i<20; i++) {
  let r1 = rand(-10, 5), r2 = r1 + rand(2, 10);
  let b = -(r1+r2), c = r1*r2;
  let bStr = b > 0 ? `+ ${b}` : (b < 0 ? `- ${-b}` : '');
  let cStr = c > 0 ? `+ ${c}` : (c < 0 ? `- ${-c}` : '');
  let sign = rand(0,1) ? '< 0' : '> 0';
  let ans = sign === '< 0' ? `${r1} < x < ${r2}` : `x < ${r1} или x > ${r2}`;
  let badAns = sign === '< 0' ? `x < ${r1} или x > ${r2}` : `${r1} < x < ${r2}`;
  addQ('algebra', 'inequalities', 
    `Решите неравенство: x² ${bStr}x ${cStr} ${sign}`,
    `Барабарсыздыкты чыгаргыла: x² ${bStr}x ${cStr} ${sign}`,
    ans, [badAns, `${r1-1} < x < ${r2+1}`, `нет решений`]);
}

for(let i=0; i<20; i++) {
  let x = rand(-5, 5), y = rand(-5, 5);
  let a1 = rand(1, 5), b1 = rand(1, 4), c1 = a1*x + b1*y;
  let a2 = rand(1, 3), b2 = rand(-3, -1), c2 = a2*x + b2*y;
  addQ('algebra', 'systems_of_equations',
    `Решите систему: ${a1}x + ${b1}y = ${c1}; ${a2}x ${b2}y = ${c2}`,
    `Системаны чыгаргыла: ${a1}x + ${b1}y = ${c1}; ${a2}x ${b2}y = ${c2}`,
    `x=${x}, y=${y}`, [`x=${y}, y=${x}`, `x=${x+1}, y=${y-1}`, `нет решений`]);
}

for(let i=0; i<20; i++) {
  let a = rand(-5, 5);
  let b = rand(-5, 5);
  let res = rand(2, 6);
  if (a===b) b++;
  let x = (a - res*b) / (1 - res);
  // ensure x is integer for simplicity
  if(Number.isInteger(x) && x !== b) {
    addQ('algebra', 'rationalizing_denominator',
      `Решите уравнение: (x - ${a}) / (x - ${b}) = ${res}, где x ≠ ${b}`,
      `Теңдемени чыгаргыла: (x - ${a}) / (x - ${b}) = ${res}, мында x ≠ ${b}`,
      `x=${x}`, [`x=${x+2}`, `x=${-x}`, `нет решений`]);
  } else {
    // fallback
    addQ('algebra', 'quadratic_equations', `Найдите произведение корней x²-5x+6=0`, `Тамырлардын көбөйтүндүсүн тапкыла: x²-5x+6=0`, `6`, [`-6`, `5`, `-5`]);
  }
}

for(let i=0; i<40; i++) {
  if(i%2===0) {
    let base = rand(2, 5);
    let x = rand(1, 4);
    let p1 = rand(1, 3);
    let val = Math.pow(base, x+p1);
    addQ('algebra', 'powers',
      `Решите показательное уравнение: ${base}^(x+${p1}) = ${val}`,
      `Көрсөткүчтүү теңдемени чыгаргыла: ${base}^(x+${p1}) = ${val}`,
      `x=${x}`, [`x=${x+1}`, `x=${x-1}`, `нет решений`]);
  } else {
    let base = rand(2, 5);
    let p = rand(1, 3);
    let v = Math.pow(base, p);
    let offset = rand(1, 10);
    let x = v - offset;
    addQ('algebra', 'logarithms',
      `Решите логарифмическое уравнение: log_${base}(x+${offset}) = ${p}`,
      `Логарифмдик теңдемени чыгаргыла: log_${base}(x+${offset}) = ${p}`,
      `x=${x}`, [`x=${x+2}`, `x=${-x}`, `нет решений`]);
  }
}

for(let i=0; i<20; i++) {
  if(i%2===0) {
    let a1 = rand(-10, 10), d = rand(2, 7), n = rand(10, 30);
    let an = a1 + d*(n-1);
    addQ('algebra', 'progressions',
      `В арифметической прогрессии a₁=${a1}, d=${d}. Найдите a_${n}.`,
      `Арифметикалык прогрессияда a₁=${a1}, d=${d}. a_${n} тапкыла.`,
      an, [an+d, an-d, an+2*d]);
  } else {
    let b1 = rand(1, 5), q = rand(2, 3), n = rand(4, 6);
    let bn = b1 * Math.pow(q, n-1);
    addQ('algebra', 'progressions',
      `В геометрической прогрессии b₁=${b1}, q=${q}. Найдите b_${n}.`,
      `Геометриялык прогрессияда b₁=${b1}, q=${q}. b_${n} тапкыла.`,
      bn, [bn*q, Math.floor(bn/q), bn+q]);
  }
}

for(let i=0; i<30; i++) {
  if(i%2===0) {
    let k = rand(-5, 5), b = rand(-10, 10);
    if(k===0) k=1;
    let x = rand(-5, 5);
    addQ('algebra', 'functions',
      `Функция f(x)=${k}x ${b>=0?'+':''}${b}. Найдите f(${x}).`,
      `Функция f(x)=${k}x ${b>=0?'+':''}${b}. f(${x}) тапкыла.`,
      k*x+b, [k*x+b+2, k*x+b-3, -(k*x+b)]);
  } else {
    let a = rand(2, 5), c = rand(5, 15);
    let r1 = c + a, r2 = -(c - a); 
    addQ('algebra', 'complex_expressions',
      `Решите уравнение: |x - ${a}| = ${c}`,
      `Теңдемени чыгаргыла: |x - ${a}| = ${c}`,
      `${Math.min(r1,r2)} и ${Math.max(r1,r2)}`, [`${r1} и ${r2+1}`, `нет решений`, `${-r1} и ${-r2}`]);
  }
}

const codeFile = 'artifacts/iga-ready/src/data/questions.ts';
let code = fs.readFileSync(codeFile, 'utf8');

let exportString = "export const SUPPLEMENTARY_QUESTIONS: any[] = " + JSON.stringify(newSubQuestions, null, 2) + ";\n";

if(code.indexOf('SUPPLEMENTARY_QUESTIONS') !== -1) {
  code = code.replace(/export const SUPPLEMENTARY_QUESTIONS([\s\S]*?);/g, '');
  code = code.replace(', ...SUPPLEMENTARY_QUESTIONS', '');
}

code = code.replace('export const ALL_QUESTIONS = ', exportString + "\nexport const ALL_QUESTIONS = ");
code = code.replace('...RUSSIAN_QUESTIONS', '...RUSSIAN_QUESTIONS, ...SUPPLEMENTARY_QUESTIONS');

fs.writeFileSync(codeFile, code);
console.log(`Added ${newSubQuestions.length} new supplementary questions!`);
