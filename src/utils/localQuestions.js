// Deterministic question generators — no API needed

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplifyFraction(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return [n / g, d / g];
}

function fractionToString(n, d) {
  const [sn, sd] = simplifyFraction(n, d);
  if (sd === 1) return `${sn}`;
  return `${sn}/${sd}`;
}

function frac(n, d) {
  const [sn, sd] = simplifyFraction(n, d);
  if (sd === 1) return `${sn}`;
  return `\\frac{${sn}}{${sd}}`;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

// Generate shuffled multiple choice options from correct answer + wrong alternatives
function makeChoices(correct, wrongs) {
  const all = [correct, ...wrongs];
  // Shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

// Difficulty ranges — leicht/mittel are close, schwer is a big step up
const DIFF = {
  leicht: { fracDen: [2, 6], potBase: [2, 5], potExp: [2, 2] },
  mittel: { fracDen: [2, 10], potBase: [2, 8], potExp: [2, 3] },
  schwer: { fracDen: [5, 25], potBase: [2, 15], potExp: [2, 5] },
};

function randFrac(difficulty) {
  const d = DIFF[difficulty];
  const den = randInt(...d.fracDen);
  const num = randInt(1, den - 1);
  return [num, den];
}

// --- Bruchrechnung ---

function bruchKuerzen(difficulty) {
  const ranges = { leicht: [2, 5], mittel: [2, 8], schwer: [3, 12] };
  const factor = randInt(...ranges[difficulty]);
  const [sn, sd] = [randInt(1, 6), randInt(2, 8)];
  // Make sure fraction isn't already in simplest form
  const n = sn * factor;
  const d = sd * factor;
  if (gcd(sn, sd) > 1) {
    // Already simplifiable further, just use it
  }
  return {
    question: `Kuerze: $${frac(n, d)}$`,
    answer: fractionToString(n, d),
    hint: `Zaehler und Nenner sind beide durch $${factor}$ teilbar`,
    explanation: `$${frac(n, d)} = \\frac{${n} \\div ${factor}}{${d} \\div ${factor}} = ${frac(sn, sd)}$`,
    topic: 'Kuerzen',
  };
}

function bruchAddSub(difficulty) {
  const op = pick(['+', '-']);
  const [n1, d1] = randFrac(difficulty);
  const [n2, d2] = randFrac(difficulty);

  const lcd = (d1 * d2) / gcd(d1, d2);
  const resultNum = op === '+'
    ? n1 * (lcd / d1) + n2 * (lcd / d2)
    : n1 * (lcd / d1) - n2 * (lcd / d2);

  return {
    question: `Berechne: $${frac(n1, d1)} ${op} ${frac(n2, d2)}$`,
    answer: fractionToString(resultNum, lcd),
    hint: `Finde den gemeinsamen Nenner: $${lcd}$`,
    explanation: `$${frac(n1, d1)} = ${frac(n1 * (lcd / d1), lcd)}$, $${frac(n2, d2)} = ${frac(n2 * (lcd / d2), lcd)}$. Ergebnis: $${frac(resultNum, lcd)}$`,
    topic: op === '+' ? 'Addition' : 'Subtraktion',
  };
}

function bruchMul(difficulty) {
  const [n1, d1] = randFrac(difficulty);
  const [n2, d2] = randFrac(difficulty);

  return {
    question: `Berechne: $${frac(n1, d1)} \\cdot ${frac(n2, d2)}$`,
    answer: fractionToString(n1 * n2, d1 * d2),
    hint: 'Zaehler mal Zaehler, Nenner mal Nenner',
    explanation: `$\\frac{${n1} \\cdot ${n2}}{${d1} \\cdot ${d2}} = ${frac(n1 * n2, d1 * d2)}$`,
    topic: 'Multiplikation',
  };
}

function bruchDiv(difficulty) {
  const [n1, d1] = randFrac(difficulty);
  const [n2, d2] = randFrac(difficulty);

  return {
    question: `Berechne: $${frac(n1, d1)} \\div ${frac(n2, d2)}$`,
    answer: fractionToString(n1 * d2, d1 * n2),
    hint: 'Division = Multiplikation mit dem Kehrwert',
    explanation: `$${frac(n1, d1)} \\cdot ${frac(d2, n2)} = ${frac(n1 * d2, d1 * n2)}$`,
    topic: 'Division',
  };
}

function bruchGemischt(difficulty) {
  const [n1, d1] = randFrac(difficulty);
  const [n2, d2] = randFrac(difficulty);
  const [n3, d3] = randFrac(difficulty);

  const multNum = n2 * n3;
  const multDen = d2 * d3;
  const lcd = (d1 * multDen) / gcd(d1, multDen);
  const resultNum = n1 * (lcd / d1) + multNum * (lcd / multDen);

  return {
    question: `Berechne: $${frac(n1, d1)} + ${frac(n2, d2)} \\cdot ${frac(n3, d3)}$`,
    answer: fractionToString(resultNum, lcd),
    hint: 'Punkt vor Strich: zuerst die Multiplikation',
    explanation: `Erst $${frac(n2, d2)} \\cdot ${frac(n3, d3)} = ${frac(multNum, multDen)}$, dann $${frac(n1, d1)} + ${frac(multNum, multDen)} = ${frac(resultNum, lcd)}$`,
    topic: 'Gemischte Operationen',
  };
}

// schwer: Bruch mit Variablen — kuerze a*x / b*x
function bruchVariable() {
  const a = randInt(2, 8);
  const b = randInt(2, 8);
  const correct = `$${frac(a, b)}$`;
  const wrongs = [
    `$${frac(b, a)}$`,
    `$${frac(a + 1, b)}$`,
    `$${frac(a, b + 1)}$`,
  ];
  return {
    question: `Kuerze: $\\frac{${a}x}{${b}x}$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: '$x$ kuerzt sich raus',
    explanation: `$\\frac{${a}x}{${b}x} = \\frac{${a}}{${b}} = ${frac(a, b)}$`,
    topic: 'Kuerzen mit Variablen',
  };
}

// schwer: Bruch-Addition mit Variablen
function bruchVariableAddSub() {
  const op = pick(['+', '-']);
  const a = randInt(1, 6);
  const b = randInt(1, 6);
  const result = op === '+' ? a + b : a - b;
  const correct = `$\\frac{${result}}{x}$`;
  const wrongs = [
    `$\\frac{${result}}{2x}$`,
    `$\\frac{${result + 1}}{x}$`,
    `$\\frac{${Math.abs(result - 1)}}{x}$`,
  ];
  return {
    question: `Vereinfache: $\\frac{${a}}{x} ${op} \\frac{${b}}{x}$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: 'Gleicher Nenner — Zaehler direkt verrechnen',
    explanation: `$\\frac{${a}}{x} ${op} \\frac{${b}}{x} = \\frac{${a} ${op} ${b}}{x} = \\frac{${result}}{x}$`,
    topic: 'Brueche mit Variablen',
  };
}

// --- Potenzrechnung ---

function potenzBerechne(difficulty) {
  const d = DIFF[difficulty];
  const base = randInt(...d.potBase);
  const exp = randInt(...d.potExp);
  const result = Math.pow(base, exp);

  return {
    question: `Berechne: $${base}^{${exp}}$`,
    answer: `${result}`,
    hint: `$${base}$ wird $${exp}$-mal mit sich selbst multipliziert`,
    explanation: `$${Array(exp).fill(base).join(' \\cdot ')} = ${result}$`,
    topic: 'Potenzen',
  };
}

function potenzGesetzMul(difficulty) {
  const d = DIFF[difficulty];
  const base = randInt(...d.potBase);
  const e1 = randInt(1, d.potExp[1] + 1);
  const e2 = randInt(1, d.potExp[1] + 1);

  return {
    question: `Vereinfache: $${base}^{${e1}} \\cdot ${base}^{${e2}}$`,
    answer: `${base}^${e1 + e2}`,
    hint: 'Gleiche Basis: Exponenten addieren',
    explanation: `$${base}^{${e1}} \\cdot ${base}^{${e2}} = ${base}^{${e1}+${e2}} = ${base}^{${e1 + e2}}$`,
    topic: 'Potenzgesetze',
  };
}

function potenzGesetzDiv(difficulty) {
  const d = DIFF[difficulty];
  const base = randInt(...d.potBase);
  const e1 = randInt(3, d.potExp[1] + 4);
  const e2 = randInt(1, e1 - 1);

  return {
    question: `Vereinfache: $\\frac{${base}^{${e1}}}{${base}^{${e2}}}$`,
    answer: `${base}^${e1 - e2}`,
    hint: 'Gleiche Basis: Exponenten subtrahieren',
    explanation: `$\\frac{${base}^{${e1}}}{${base}^{${e2}}} = ${base}^{${e1}-${e2}} = ${base}^{${e1 - e2}}$`,
    topic: 'Potenzgesetze',
  };
}

function potenzGesetzPow(difficulty) {
  const d = DIFF[difficulty];
  const base = randInt(2, Math.min(d.potBase[1], 6));
  const e1 = randInt(2, d.potExp[1]);
  const e2 = randInt(2, 3);

  return {
    question: `Vereinfache: $\\left(${base}^{${e1}}\\right)^{${e2}}$`,
    answer: `${base}^${e1 * e2}`,
    hint: 'Potenz einer Potenz: Exponenten multiplizieren',
    explanation: `$\\left(${base}^{${e1}}\\right)^{${e2}} = ${base}^{${e1} \\cdot ${e2}} = ${base}^{${e1 * e2}}$`,
    topic: 'Potenzgesetze',
  };
}

function potenzWurzel(difficulty) {
  const d = DIFF[difficulty];
  const root = randInt(2, d.potBase[1] + 3);
  const square = root * root;

  return {
    question: `Berechne: $\\sqrt{${square}}$`,
    answer: `${root}`,
    hint: `Welche Zahl ergibt mit sich selbst multipliziert $${square}$?`,
    explanation: `$${root} \\cdot ${root} = ${square}$, also $\\sqrt{${square}} = ${root}$`,
    topic: 'Wurzeln',
  };
}

// Negative Exponenten
function potenzNegativ(difficulty) {
  const ranges = { leicht: [2, 5], mittel: [2, 8], schwer: [2, 10] };
  const base = randInt(...ranges[difficulty]);
  const exp = randInt(1, 3);
  const result = Math.pow(base, exp);
  const correct = `$\\frac{1}{${result}}$`;
  const wrongs = [
    `$-${result}$`,
    `$\\frac{1}{${result + 1}}$`,
    `$${result}$`,
  ];
  return {
    question: `Berechne: $${base}^{-${exp}}$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: `$a^{-n} = \\frac{1}{a^n}$`,
    explanation: `$${base}^{-${exp}} = \\frac{1}{${base}^{${exp}}} = \\frac{1}{${result}}$`,
    topic: 'Negative Exponenten',
  };
}

// Bruch-Exponenten (rationale Exponenten)
function potenzRational(difficulty) {
  // a^(1/2) = sqrt(a), a^(1/3) = cbrt(a)
  const type = pick(['half', 'third']);

  if (type === 'half') {
    const ranges = { leicht: [2, 6], mittel: [2, 10], schwer: [2, 15] };
    const root = randInt(...ranges[difficulty]);
    const base = root * root;
    return {
      question: `Berechne: $${base}^{\\frac{1}{2}}$`,
      answer: `${root}`,
      hint: `$a^{\\frac{1}{2}} = \\sqrt{a}$`,
      explanation: `$${base}^{\\frac{1}{2}} = \\sqrt{${base}} = ${root}$`,
      topic: 'Rationale Exponenten',
    };
  } else {
    const roots = { leicht: [2, 3], mittel: [2, 5], schwer: [2, 6] };
    const root = randInt(...roots[difficulty]);
    const base = root * root * root;
    return {
      question: `Berechne: $${base}^{\\frac{1}{3}}$`,
      answer: `${root}`,
      hint: `$a^{\\frac{1}{3}} = \\sqrt[3]{a}$`,
      explanation: `$${base}^{\\frac{1}{3}} = \\sqrt[3]{${base}} = ${root}$`,
      topic: 'Rationale Exponenten',
    };
  }
}

// Kombination: a^(m/n)
function potenzRationalKombiniert(difficulty) {
  const ranges = { leicht: [2, 4], mittel: [2, 6], schwer: [2, 8] };
  const root = randInt(...ranges[difficulty]);
  const base = root * root;
  const exp = randInt(2, 3);
  const result = Math.pow(root, exp);
  return {
    question: `Berechne: $${base}^{\\frac{${exp}}{2}}$`,
    answer: `${result}`,
    hint: `$a^{\\frac{m}{n}} = \\left(\\sqrt[n]{a}\\right)^m$`,
    explanation: `$${base}^{\\frac{${exp}}{2}} = \\left(\\sqrt{${base}}\\right)^{${exp}} = ${root}^{${exp}} = ${result}$`,
    topic: 'Rationale Exponenten',
  };
}

// schwer: Potenzgesetze mit Variablen
function potenzVariableMul() {
  const e1 = randInt(2, 6);
  const e2 = randInt(2, 6);
  const correct = `$x^{${e1 + e2}}$`;
  const wrongs = [
    `$x^{${e1 * e2}}$`,
    `$x^{${e1 + e2 + 1}}$`,
    `$x^{${e1 + e2 - 1}}$`,
  ];
  return {
    question: `Vereinfache: $x^{${e1}} \\cdot x^{${e2}}$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: 'Gleiche Basis: Exponenten addieren',
    explanation: `$x^{${e1}} \\cdot x^{${e2}} = x^{${e1}+${e2}} = x^{${e1 + e2}}$`,
    topic: 'Potenzgesetze mit Variablen',
  };
}

function potenzVariableDiv() {
  const e1 = randInt(4, 10);
  const e2 = randInt(1, e1 - 1);
  const correct = `$x^{${e1 - e2}}$`;
  const wrongs = [
    `$x^{${e1 + e2}}$`,
    `$x^{${e1 * e2}}$`,
    `$x^{${Math.abs(e1 - e2 - 1)}}$`,
  ];
  return {
    question: `Vereinfache: $\\frac{x^{${e1}}}{x^{${e2}}}$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: 'Gleiche Basis: Exponenten subtrahieren',
    explanation: `$\\frac{x^{${e1}}}{x^{${e2}}} = x^{${e1}-${e2}} = x^{${e1 - e2}}$`,
    topic: 'Potenzgesetze mit Variablen',
  };
}

function potenzVariablePow() {
  const e1 = randInt(2, 5);
  const e2 = randInt(2, 4);
  const correct = `$x^{${e1 * e2}}$`;
  const wrongs = [
    `$x^{${e1 + e2}}$`,
    `$x^{${e1 * e2 + 1}}$`,
    `$x^{${e1 * e2 - 1}}$`,
  ];
  return {
    question: `Vereinfache: $\\left(x^{${e1}}\\right)^{${e2}}$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: 'Potenz einer Potenz: Exponenten multiplizieren',
    explanation: `$\\left(x^{${e1}}\\right)^{${e2}} = x^{${e1} \\cdot ${e2}} = x^{${e1 * e2}}$`,
    topic: 'Potenzgesetze mit Variablen',
  };
}

// schwer: Kombination mit Koeffizienten
function potenzVariableKoeff() {
  const a = randInt(2, 6);
  const b = randInt(2, 6);
  const e1 = randInt(2, 4);
  const e2 = randInt(2, 4);
  const correct = `$${a * b}x^{${e1 + e2}}$`;
  const wrongs = [
    `$${a + b}x^{${e1 + e2}}$`,
    `$${a * b}x^{${e1 * e2}}$`,
    `$${a * b}x^{${e1 + e2 + 1}}$`,
  ];
  return {
    question: `Vereinfache: $${a}x^{${e1}} \\cdot ${b}x^{${e2}}$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: 'Koeffizienten multiplizieren, Exponenten addieren',
    explanation: `$${a} \\cdot ${b} = ${a * b}$, $x^{${e1}} \\cdot x^{${e2}} = x^{${e1 + e2}}$, also $${a * b}x^{${e1 + e2}}$`,
    topic: 'Potenzgesetze mit Variablen',
  };
}

// --- Kopfrechnen ---

function kopfAdd(difficulty) {
  const ranges = { leicht: [1, 20], mittel: [10, 100], schwer: [100, 999] };
  const [min, max] = ranges[difficulty];
  const a = randInt(min, max);
  const b = randInt(min, max);
  return {
    question: `$${a} + ${b}$`,
    answer: `${a + b}`,
    hint: 'Zerlege in Zehner und Einer',
    explanation: `$${a} + ${b} = ${a + b}$`,
    topic: 'Addition',
  };
}

function kopfSub(difficulty) {
  const ranges = { leicht: [1, 20], mittel: [10, 100], schwer: [100, 999] };
  const [min, max] = ranges[difficulty];
  let a = randInt(min, max);
  let b = randInt(min, max);
  if (b > a) [a, b] = [b, a];
  return {
    question: `$${a} - ${b}$`,
    answer: `${a - b}`,
    hint: 'Zerlege in Schritte',
    explanation: `$${a} - ${b} = ${a - b}$`,
    topic: 'Subtraktion',
  };
}

function kopfMul(difficulty) {
  const ranges = { leicht: [[2, 10], [2, 10]], mittel: [[2, 12], [2, 20]], schwer: [[10, 50], [10, 50]] };
  const [r1, r2] = ranges[difficulty];
  const a = randInt(...r1);
  const b = randInt(...r2);
  return {
    question: `$${a} \\cdot ${b}$`,
    answer: `${a * b}`,
    hint: 'Zerlege einen Faktor',
    explanation: `$${a} \\cdot ${b} = ${a * b}$`,
    topic: 'Multiplikation',
  };
}

function kopfDiv(difficulty) {
  const ranges = { leicht: [[2, 10], [2, 10]], mittel: [[2, 12], [2, 15]], schwer: [[5, 25], [10, 40]] };
  const [r1, r2] = ranges[difficulty];
  const b = randInt(...r1);
  const result = randInt(...r2);
  const a = b * result;
  return {
    question: `$${a} \\div ${b}$`,
    answer: `${result}`,
    hint: `Welche Zahl mal $${b}$ ergibt $${a}$?`,
    explanation: `$${a} \\div ${b} = ${result}$`,
    topic: 'Division',
  };
}

// schwer: Kopfrechnen mit Variablen — einfache Gleichungen
function kopfGleichung() {
  const op = pick(['+', '-', '*']);
  const x = randInt(2, 20);

  if (op === '+') {
    const b = randInt(1, 30);
    const result = x + b;
    return {
      question: `Loese: $x + ${b} = ${result}$`,
      answer: `${x}`,
      hint: `$x = ${result} - ${b}$`,
      explanation: `$x = ${result} - ${b} = ${x}$`,
      topic: 'Gleichungen',
    };
  } else if (op === '-') {
    const b = randInt(1, x - 1);
    const result = x - b;
    return {
      question: `Loese: $x - ${b} = ${result}$`,
      answer: `${x}`,
      hint: `$x = ${result} + ${b}$`,
      explanation: `$x = ${result} + ${b} = ${x}$`,
      topic: 'Gleichungen',
    };
  } else {
    const b = randInt(2, 12);
    const result = x * b;
    return {
      question: `Loese: $${b}x = ${result}$`,
      answer: `${x}`,
      hint: `$x = \\frac{${result}}{${b}}$`,
      explanation: `$x = \\frac{${result}}{${b}} = ${x}$`,
      topic: 'Gleichungen',
    };
  }
}

// --- Quadratzahlen ---

function quadratBerechne(difficulty) {
  const ranges = { leicht: [2, 12], mittel: [5, 20], schwer: [15, 40] };
  const n = randInt(...ranges[difficulty]);
  return {
    question: `Berechne: $${n}^2$`,
    answer: `${n * n}`,
    hint: `$${n} \\cdot ${n}$`,
    explanation: `$${n}^2 = ${n} \\cdot ${n} = ${n * n}$`,
    topic: 'Quadratzahlen',
  };
}

function quadratWurzel(difficulty) {
  const ranges = { leicht: [2, 12], mittel: [5, 20], schwer: [15, 40] };
  const n = randInt(...ranges[difficulty]);
  const sq = n * n;
  return {
    question: `Berechne: $\\sqrt{${sq}}$`,
    answer: `${n}`,
    hint: `Welche Zahl ergibt quadriert $${sq}$?`,
    explanation: `$\\sqrt{${sq}} = ${n}$, denn $${n}^2 = ${sq}$`,
    topic: 'Quadratwurzeln',
  };
}

function quadratErkennen(difficulty) {
  const ranges = { leicht: [2, 12], mittel: [5, 20], schwer: [15, 40] };
  const n = randInt(...ranges[difficulty]);
  const sq = n * n;
  const isQuadrat = pick([true, false]);

  if (isQuadrat) {
    return {
      question: `Ist $${sq}$ eine Quadratzahl?`,
      answer: 'ja',
      choices: ['Ja', 'Nein'],
      hint: `Versuche die Wurzel zu ziehen`,
      explanation: `$${sq} = ${n}^2$, also ja`,
      topic: 'Quadratzahlen erkennen',
    };
  } else {
    const offset = pick([-1, 1, 2, -2].filter(o => sq + o > 1));
    const notSq = sq + offset;
    return {
      question: `Ist $${notSq}$ eine Quadratzahl?`,
      answer: 'nein',
      choices: ['Ja', 'Nein'],
      hint: `Die naechste Quadratzahl ist $${sq}$`,
      explanation: `$${n}^2 = ${sq}$, aber $${notSq} \\neq ${sq}$, also nein`,
      topic: 'Quadratzahlen erkennen',
    };
  }
}

// schwer: (a+b)² oder (a-b)² als Quadratzahl-Trick
function quadratVariable() {
  const type = pick(['sum', 'diff']);
  const a = randInt(2, 10);
  const b = randInt(1, 5);
  if (type === 'sum') {
    const result = (a + b) * (a + b);
    return {
      question: `Berechne: $(${a} + ${b})^2$`,
      answer: `${result}`,
      hint: `$(${a}+${b}) = ${a + b}$, dann quadrieren`,
      explanation: `$(${a}+${b})^2 = ${a + b}^2 = ${result}$`,
      topic: 'Quadratzahlen',
    };
  } else {
    const result = (a - b) * (a - b);
    return {
      question: `Berechne: $(${a} - ${b})^2$`,
      answer: `${result}`,
      hint: `$(${a}-${b}) = ${a - b}$, dann quadrieren`,
      explanation: `$(${a}-${b})^2 = ${a - b}^2 = ${result}$`,
      topic: 'Quadratzahlen',
    };
  }
}

// --- Terme & Gleichungen ---

// Ausmultiplizieren: a(bx + c)
function termeAusmultiplizieren(difficulty) {
  const ranges = { leicht: [2, 5], mittel: [2, 8], schwer: [3, 12] };
  const a = randInt(...ranges[difficulty]);
  const b = randInt(1, ranges[difficulty][1]);
  const c = randInt(1, ranges[difficulty][1]);
  const op = pick(['+', '-']);
  const ab = a * b;
  const ac = a * c;

  const correct = `$${ab}x ${op} ${ac}$`;
  const wrongs = [
    `$${ab}x ${op === '+' ? '-' : '+'} ${ac}$`,
    `$${a + b}x ${op} ${ac}$`,
    `$${ab}x ${op} ${a + c}$`,
  ];
  return {
    question: `Multipliziere aus: $${a}(${b}x ${op} ${c})$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: `Distributivgesetz: $a(b+c) = ab + ac$`,
    explanation: `$${a} \\cdot ${b}x = ${ab}x$, $${a} \\cdot ${op === '+' ? '' : '(-'}${c}${op === '-' ? ')' : ''} = ${op}${ac}$`,
    topic: 'Ausmultiplizieren',
  };
}

// Ausklammern: abx + ac = a(bx + c)
function termeAusklammern(difficulty) {
  const ranges = { leicht: [2, 4], mittel: [2, 6], schwer: [3, 10] };
  const a = randInt(...ranges[difficulty]);
  let b, c;
  // Ensure b and c are coprime so a is actually the GCD
  do {
    b = randInt(1, ranges[difficulty][1]);
    c = randInt(1, ranges[difficulty][1]);
  } while (gcd(b, c) > 1 || b === c);
  const ab = a * b;
  const ac = a * c;

  const correct = `$${a}(${b}x + ${c})$`;
  const wrongs = [
    `$${b}(${a}x + ${c})$`,
    `$${a}(${b}x + ${a + c})$`,
    `$${a}(${b + 1}x + ${c})$`,
  ];
  return {
    question: `Klammere aus: $${ab}x + ${ac}$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: `Finde den groessten gemeinsamen Faktor von $${ab}$ und $${ac}$`,
    explanation: `GGT von $${ab}$ und $${ac}$ ist $${a}$: $${ab}x + ${ac} = ${a}(${b}x + ${c})$`,
    topic: 'Ausklammern',
  };
}

// Terme vereinfachen: ax + b + cx + d
function termeVereinfachen(difficulty) {
  const ranges = { leicht: [1, 5], mittel: [1, 10], schwer: [2, 15] };
  const a = randInt(...ranges[difficulty]);
  const c = randInt(1, ranges[difficulty][1]);
  const b = randInt(1, ranges[difficulty][1]);
  const d = randInt(1, ranges[difficulty][1]);
  const op1 = pick(['+', '-']);
  const op2 = pick(['+', '-']);

  const xCoeff = op1 === '+' ? a + c : a - c;
  const constant = op2 === '+' ? b + d : b - d;

  const constPart = constant >= 0 ? `+ ${constant}` : `- ${Math.abs(constant)}`;
  const answer = `${xCoeff}x ${constPart}`;

  return {
    question: `Vereinfache: $${a}x + ${b} ${op1} ${c}x ${op2} ${d}$`,
    answer,
    hint: 'Fasse x-Terme und Zahlen getrennt zusammen',
    explanation: `$x$-Terme: $${a}x ${op1} ${c}x = ${xCoeff}x$. Zahlen: $${b} ${op2} ${d} = ${constant}$. Ergebnis: $${answer}$`,
    topic: 'Terme vereinfachen',
  };
}

// Distributivgesetz: (a+b)(c+d) — schwer
function termeDistributivDoppelt(difficulty) {
  const ranges = { leicht: [1, 3], mittel: [1, 5], schwer: [2, 8] };
  const a = randInt(...ranges[difficulty]);
  const b = randInt(1, ranges[difficulty][1]);
  const c = randInt(1, ranges[difficulty][1]);
  const d = randInt(1, ranges[difficulty][1]);

  const xCoeff = a * c;
  const mid = a * d + b * c;
  const constant = b * d;

  const correct = `$${xCoeff}x^2 + ${mid}x + ${constant}$`;
  const wrongs = [
    `$${xCoeff}x^2 + ${a * d}x + ${constant}$`,
    `$${xCoeff}x^2 + ${mid}x - ${constant}$`,
    `$${xCoeff + 1}x^2 + ${mid}x + ${constant}$`,
  ];
  return {
    question: `Multipliziere aus: $(${a}x + ${b})(${c}x + ${d})$`,
    answer: correct,
    choices: makeChoices(correct, wrongs),
    hint: 'Jedes Glied der ersten Klammer mit jedem der zweiten multiplizieren',
    explanation: `$${a}x \\cdot ${c}x + ${a}x \\cdot ${d} + ${b} \\cdot ${c}x + ${b} \\cdot ${d} = ${xCoeff}x^2 + ${mid}x + ${constant}$`,
    topic: 'Distributivgesetz',
  };
}

// Einfache lineare Gleichung: ax + b = c
function termeGleichung(difficulty) {
  const ranges = { leicht: [2, 5], mittel: [2, 8], schwer: [3, 12] };
  const a = randInt(...ranges[difficulty]);
  const x = randInt(1, ranges[difficulty][1]);
  const b = randInt(1, ranges[difficulty][1]);
  const c = a * x + b;

  return {
    question: `Loese: $${a}x + ${b} = ${c}$`,
    answer: `${x}`,
    hint: `Erst $${b}$ subtrahieren, dann durch $${a}$ teilen`,
    explanation: `$${a}x = ${c} - ${b} = ${c - b}$, $x = \\frac{${c - b}}{${a}} = ${x}$`,
    topic: 'Lineare Gleichungen',
  };
}

// Gleichung mit x auf beiden Seiten — schwer
function termeGleichungBeidseitig() {
  const a = randInt(3, 8);
  const b = randInt(1, 10);
  const c = randInt(1, a - 1);
  const d = randInt(1, 15);
  // ax + b = cx + d → (a-c)x = d-b → x = (d-b)/(a-c)
  const xNum = d - b;
  const xDen = a - c;

  // Only use when x is integer
  if (xNum % xDen !== 0) {
    // Fallback to simple equation
    const x = randInt(1, 8);
    const result = a * x + b;
    return {
      question: `Loese: $${a}x + ${b} = ${result}$`,
      answer: `${x}`,
      hint: `Erst $${b}$ subtrahieren, dann durch $${a}$ teilen`,
      explanation: `$${a}x = ${result - b}$, $x = ${x}$`,
      topic: 'Lineare Gleichungen',
    };
  }

  const x = xNum / xDen;
  return {
    question: `Loese: $${a}x + ${b} = ${c}x + ${d}$`,
    answer: `${x}`,
    hint: `Bringe $x$ auf eine Seite: $${a}x - ${c}x = ${d} - ${b}$`,
    explanation: `$${a - c}x = ${d - b}$, $x = \\frac{${d - b}}{${a - c}} = ${x}$`,
    topic: 'Lineare Gleichungen',
  };
}

// --- Binomische Formeln ---

function binom1(difficulty) {
  // (a + b)² = a² + 2ab + b²
  const ranges = { leicht: [1, 5], mittel: [2, 8], schwer: [3, 15] };
  const a = randInt(...ranges[difficulty]);
  const b = randInt(1, ranges[difficulty][1]);
  const a2 = a * a;
  const b2 = b * b;
  const ab2 = 2 * a * b;

  if (difficulty === 'schwer') {
    const correct = `$${a2}x^2 + ${ab2}x + ${b2}$`;
    const wrongs = [
      `$${a2}x^2 - ${ab2}x + ${b2}$`,
      `$${a2}x^2 + ${ab2}x - ${b2}$`,
      `$${a2}x^2 + ${a * b}x + ${b2}$`,
    ];
    return {
      question: `Multipliziere aus: $(${a}x + ${b})^2$`,
      answer: correct,
      choices: makeChoices(correct, wrongs),
      hint: '1. Binomische Formel: $(a+b)^2 = a^2 + 2ab + b^2$',
      explanation: `$(${a}x+${b})^2 = (${a}x)^2 + 2 \\cdot ${a}x \\cdot ${b} + ${b}^2 = ${a2}x^2 + ${ab2}x + ${b2}$`,
      topic: '1. Binomische Formel',
    };
  }

  if (pick([true, false])) {
    return {
      question: `Berechne: $(${a} + ${b})^2$`,
      answer: `${a2 + ab2 + b2}`,
      hint: '1. Binomische Formel: $(a+b)^2 = a^2 + 2ab + b^2$',
      explanation: `$(${a}+${b})^2 = ${a}^2 + 2 \\cdot ${a} \\cdot ${b} + ${b}^2 = ${a2} + ${ab2} + ${b2} = ${a2 + ab2 + b2}$`,
      topic: '1. Binomische Formel',
    };
  } else {
    const correct = `$x^2 + ${2 * b}x + ${b2}$`;
    const wrongs = [
      `$x^2 - ${2 * b}x + ${b2}$`,
      `$x^2 + ${b}x + ${b2}$`,
      `$x^2 + ${2 * b}x - ${b2}$`,
    ];
    return {
      question: `Multipliziere aus: $(x + ${b})^2$`,
      answer: correct,
      choices: makeChoices(correct, wrongs),
      hint: '1. Binomische Formel: $(a+b)^2 = a^2 + 2ab + b^2$',
      explanation: `$(x+${b})^2 = x^2 + 2 \\cdot x \\cdot ${b} + ${b}^2 = x^2 + ${2 * b}x + ${b2}$`,
      topic: '1. Binomische Formel',
    };
  }
}

function binom2(difficulty) {
  // (a - b)² = a² - 2ab + b²
  const ranges = { leicht: [1, 5], mittel: [2, 8], schwer: [3, 15] };
  const a = randInt(...ranges[difficulty]);
  const b = randInt(1, Math.min(a, ranges[difficulty][1]));
  const a2 = a * a;
  const b2 = b * b;
  const ab2 = 2 * a * b;

  if (difficulty === 'schwer') {
    const correct = `$${a2}x^2 - ${ab2}x + ${b2}$`;
    const wrongs = [
      `$${a2}x^2 + ${ab2}x + ${b2}$`,
      `$${a2}x^2 - ${ab2}x - ${b2}$`,
      `$${a2}x^2 - ${a * b}x + ${b2}$`,
    ];
    return {
      question: `Multipliziere aus: $(${a}x - ${b})^2$`,
      answer: correct,
      choices: makeChoices(correct, wrongs),
      hint: '2. Binomische Formel: $(a-b)^2 = a^2 - 2ab + b^2$',
      explanation: `$(${a}x-${b})^2 = (${a}x)^2 - 2 \\cdot ${a}x \\cdot ${b} + ${b}^2 = ${a2}x^2 - ${ab2}x + ${b2}$`,
      topic: '2. Binomische Formel',
    };
  }

  if (pick([true, false])) {
    return {
      question: `Berechne: $(${a} - ${b})^2$`,
      answer: `${a2 - ab2 + b2}`,
      hint: '2. Binomische Formel: $(a-b)^2 = a^2 - 2ab + b^2$',
      explanation: `$(${a}-${b})^2 = ${a}^2 - 2 \\cdot ${a} \\cdot ${b} + ${b}^2 = ${a2} - ${ab2} + ${b2} = ${a2 - ab2 + b2}$`,
      topic: '2. Binomische Formel',
    };
  } else {
    const correct = `$x^2 - ${2 * b}x + ${b2}$`;
    const wrongs = [
      `$x^2 + ${2 * b}x + ${b2}$`,
      `$x^2 - ${b}x + ${b2}$`,
      `$x^2 - ${2 * b}x - ${b2}$`,
    ];
    return {
      question: `Multipliziere aus: $(x - ${b})^2$`,
      answer: correct,
      choices: makeChoices(correct, wrongs),
      hint: '2. Binomische Formel: $(a-b)^2 = a^2 - 2ab + b^2$',
      explanation: `$(x-${b})^2 = x^2 - 2 \\cdot x \\cdot ${b} + ${b}^2 = x^2 - ${2 * b}x + ${b2}$`,
      topic: '2. Binomische Formel',
    };
  }
}

function binom3(difficulty) {
  // (a + b)(a - b) = a² - b²
  const ranges = { leicht: [1, 5], mittel: [2, 8], schwer: [3, 15] };
  const a = randInt(...ranges[difficulty]);
  const b = randInt(1, ranges[difficulty][1]);
  const a2 = a * a;
  const b2 = b * b;

  if (difficulty === 'schwer') {
    const correct = `$${a2}x^2 - ${b2}$`;
    const wrongs = [
      `$${a2}x^2 + ${b2}$`,
      `$${a2}x^2 - ${2 * a * b}x - ${b2}$`,
      `$${a2 + b2}x^2$`,
    ];
    return {
      question: `Multipliziere aus: $(${a}x + ${b})(${a}x - ${b})$`,
      answer: correct,
      choices: makeChoices(correct, wrongs),
      hint: '3. Binomische Formel: $(a+b)(a-b) = a^2 - b^2$',
      explanation: `$(${a}x+${b})(${a}x-${b}) = (${a}x)^2 - ${b}^2 = ${a2}x^2 - ${b2}$`,
      topic: '3. Binomische Formel',
    };
  }

  if (pick([true, false])) {
    return {
      question: `Berechne: $(${a} + ${b})(${a} - ${b})$`,
      answer: `${a2 - b2}`,
      hint: '3. Binomische Formel: $(a+b)(a-b) = a^2 - b^2$',
      explanation: `$(${a}+${b})(${a}-${b}) = ${a}^2 - ${b}^2 = ${a2} - ${b2} = ${a2 - b2}$`,
      topic: '3. Binomische Formel',
    };
  } else {
    const correct = `$x^2 - ${b2}$`;
    const wrongs = [
      `$x^2 + ${b2}$`,
      `$x^2 - ${2 * b}x - ${b2}$`,
      `$x^2 - ${b}$`,
    ];
    return {
      question: `Multipliziere aus: $(x + ${b})(x - ${b})$`,
      answer: correct,
      choices: makeChoices(correct, wrongs),
      hint: '3. Binomische Formel: $(a+b)(a-b) = a^2 - b^2$',
      explanation: `$(x+${b})(x-${b}) = x^2 - ${b}^2 = x^2 - ${b2}$`,
      topic: '3. Binomische Formel',
    };
  }
}

// --- Weighted pools per difficulty ---

const BRUCH_TYPES = {
  leicht: [
    [bruchKuerzen, 3],
    [bruchAddSub, 4],
    [bruchMul, 2],
    [bruchDiv, 1],
  ],
  mittel: [
    [bruchKuerzen, 2],
    [bruchAddSub, 2],
    [bruchMul, 3],
    [bruchDiv, 3],
    [bruchGemischt, 2],
  ],
  schwer: [
    [bruchKuerzen, 1],
    [bruchAddSub, 1],
    [bruchMul, 1],
    [bruchDiv, 1],
    [bruchGemischt, 3],
    [bruchVariable, 2],
    [bruchVariableAddSub, 2],
  ],
};

const POTENZ_TYPES = {
  leicht: [
    [potenzBerechne, 4],
    [potenzWurzel, 3],
    [potenzGesetzMul, 1],
    [potenzNegativ, 1],
    [potenzRational, 1],
  ],
  mittel: [
    [potenzBerechne, 2],
    [potenzWurzel, 2],
    [potenzGesetzMul, 2],
    [potenzGesetzDiv, 2],
    [potenzGesetzPow, 1],
    [potenzNegativ, 2],
    [potenzRational, 2],
    [potenzRationalKombiniert, 1],
  ],
  schwer: [
    [potenzBerechne, 1],
    [potenzGesetzMul, 1],
    [potenzGesetzDiv, 1],
    [potenzGesetzPow, 1],
    [potenzNegativ, 2],
    [potenzRational, 1],
    [potenzRationalKombiniert, 2],
    [potenzVariableMul, 2],
    [potenzVariableDiv, 2],
    [potenzVariablePow, 2],
    [potenzVariableKoeff, 2],
  ],
};

function weightedPick(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [fn, w] of entries) {
    r -= w;
    if (r <= 0) return fn;
  }
  return entries[entries.length - 1][0];
}

const KOPF_TYPES = {
  leicht: [
    [kopfAdd, 3],
    [kopfSub, 3],
    [kopfMul, 2],
    [kopfDiv, 1],
  ],
  mittel: [
    [kopfAdd, 2],
    [kopfSub, 2],
    [kopfMul, 3],
    [kopfDiv, 3],
  ],
  schwer: [
    [kopfAdd, 1],
    [kopfSub, 1],
    [kopfMul, 2],
    [kopfDiv, 2],
    [kopfGleichung, 4],
  ],
};

const QUADRAT_TYPES = {
  leicht: [
    [quadratBerechne, 4],
    [quadratWurzel, 3],
    [quadratErkennen, 2],
  ],
  mittel: [
    [quadratBerechne, 3],
    [quadratWurzel, 3],
    [quadratErkennen, 3],
  ],
  schwer: [
    [quadratBerechne, 2],
    [quadratWurzel, 2],
    [quadratErkennen, 2],
    [quadratVariable, 4],
  ],
};

const TERME_TYPES = {
  leicht: [
    [termeAusmultiplizieren, 3],
    [termeVereinfachen, 3],
    [termeAusklammern, 2],
    [termeGleichung, 2],
  ],
  mittel: [
    [termeAusmultiplizieren, 2],
    [termeVereinfachen, 2],
    [termeAusklammern, 3],
    [termeGleichung, 3],
  ],
  schwer: [
    [termeAusmultiplizieren, 1],
    [termeVereinfachen, 1],
    [termeAusklammern, 2],
    [termeDistributivDoppelt, 3],
    [termeGleichung, 1],
    [termeGleichungBeidseitig, 3],
  ],
};

const BINOM_TYPES = {
  leicht: [
    [binom1, 3],
    [binom2, 3],
    [binom3, 2],
  ],
  mittel: [
    [binom1, 3],
    [binom2, 3],
    [binom3, 3],
  ],
  schwer: [
    [binom1, 3],
    [binom2, 3],
    [binom3, 3],
  ],
};

const POOLS = {
  kopfrechnen: KOPF_TYPES,
  quadratzahlen: QUADRAT_TYPES,
  bruchrechnung: BRUCH_TYPES,
  potenzrechnung: POTENZ_TYPES,
  terme: TERME_TYPES,
  binomisch: BINOM_TYPES,
};

const CATEGORY_LABELS = {
  kopfrechnen: 'Kopfrechnen',
  quadratzahlen: 'Quadratzahlen',
  bruchrechnung: 'Bruchrechnung',
  potenzrechnung: 'Potenzrechnung',
  terme: 'Terme & Gleichungen',
  binomisch: 'Binomische Formeln',
};

export function generateChallengeQuestion(index, difficulty, enabledCategories) {
  const cats = enabledCategories || Object.keys(POOLS);
  const cat = cats[index % cats.length];
  const q = generateLocalQuestion(cat, difficulty);
  q.challengeCategory = CATEGORY_LABELS[cat];
  return q;
}

export function getChallengeLength(enabledCategories) {
  return (enabledCategories || Object.keys(POOLS)).length;
}

export function generateRandomQuestion(difficulty, enabledCategories) {
  const cats = enabledCategories || Object.keys(POOLS);
  const cat = cats[randInt(0, cats.length - 1)];
  const q = generateLocalQuestion(cat, difficulty);
  q.challengeCategory = CATEGORY_LABELS[cat];
  return q;
}

export function generateLocalQuestion(category, difficulty) {
  const pool = POOLS[category]?.[difficulty];
  if (!pool) throw new Error(`Unbekannte Kategorie/Schwierigkeit: ${category}/${difficulty}`);
  const gen = weightedPick(pool);
  return gen(difficulty);
}
