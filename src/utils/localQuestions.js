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

// Difficulty ranges
const DIFF = {
  leicht: { fracDen: [2, 6], fracNum: 'small', potBase: [2, 5], potExp: [2, 2] },
  mittel: { fracDen: [2, 12], fracNum: 'medium', potBase: [2, 8], potExp: [2, 3] },
  schwer: { fracDen: [3, 20], fracNum: 'large', potBase: [2, 12], potExp: [2, 4] },
};

function randFrac(difficulty) {
  const d = DIFF[difficulty];
  const den = randInt(...d.fracDen);
  const num = randInt(1, den - 1);
  return [num, den];
}

// --- Bruchrechnung ---

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

// --- Kopfrechnen ---

function kopfAdd(difficulty) {
  const ranges = { leicht: [1, 20], mittel: [10, 100], schwer: [50, 500] };
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
  const ranges = { leicht: [1, 20], mittel: [10, 100], schwer: [50, 500] };
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
  const ranges = { leicht: [[2, 10], [2, 10]], mittel: [[2, 12], [2, 20]], schwer: [[5, 25], [5, 25]] };
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
  const ranges = { leicht: [[2, 10], [2, 10]], mittel: [[2, 12], [2, 15]], schwer: [[5, 20], [5, 20]] };
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

// --- Quadratzahlen ---

function quadratBerechne(difficulty) {
  const ranges = { leicht: [2, 12], mittel: [5, 20], schwer: [10, 30] };
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
  const ranges = { leicht: [2, 12], mittel: [5, 20], schwer: [10, 30] };
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
  const ranges = { leicht: [2, 12], mittel: [5, 20], schwer: [10, 30] };
  const n = randInt(...ranges[difficulty]);
  const sq = n * n;
  const isQuadrat = pick([true, false]);

  if (isQuadrat) {
    return {
      question: `Ist $${sq}$ eine Quadratzahl? (ja/nein)`,
      answer: 'ja',
      hint: `Versuche die Wurzel zu ziehen`,
      explanation: `$${sq} = ${n}^2$, also ja`,
      topic: 'Quadratzahlen erkennen',
    };
  } else {
    const offset = pick([-1, 1, 2, -2].filter(o => sq + o > 1));
    const notSq = sq + offset;
    return {
      question: `Ist $${notSq}$ eine Quadratzahl? (ja/nein)`,
      answer: 'nein',
      hint: `Die naechste Quadratzahl ist $${sq}$`,
      explanation: `$${n}^2 = ${sq}$, aber $${notSq} \\neq ${sq}$, also nein`,
      topic: 'Quadratzahlen erkennen',
    };
  }
}

// --- Binomische Formeln ---

function binom1(difficulty) {
  // (a + b)² = a² + 2ab + b²
  const ranges = { leicht: [1, 5], mittel: [2, 10], schwer: [3, 15] };
  const a = randInt(...ranges[difficulty]);
  const b = randInt(1, ranges[difficulty][1]);
  const a2 = a * a;
  const b2 = b * b;
  const ab2 = 2 * a * b;

  if (pick([true, false])) {
    // Ausmultiplizieren
    return {
      question: `Berechne: $(${a} + ${b})^2$`,
      answer: `${a2 + ab2 + b2}`,
      hint: '1. Binomische Formel: $(a+b)^2 = a^2 + 2ab + b^2$',
      explanation: `$(${a}+${b})^2 = ${a}^2 + 2 \\cdot ${a} \\cdot ${b} + ${b}^2 = ${a2} + ${ab2} + ${b2} = ${a2 + ab2 + b2}$`,
      topic: '1. Binomische Formel',
    };
  } else {
    // Mit Variablen
    return {
      question: `Multipliziere aus: $(x + ${b})^2$`,
      answer: `x^2 + ${2 * b}x + ${b2}`,
      hint: '1. Binomische Formel: $(a+b)^2 = a^2 + 2ab + b^2$',
      explanation: `$(x+${b})^2 = x^2 + 2 \\cdot x \\cdot ${b} + ${b}^2 = x^2 + ${2 * b}x + ${b2}$`,
      topic: '1. Binomische Formel',
    };
  }
}

function binom2(difficulty) {
  // (a - b)² = a² - 2ab + b²
  const ranges = { leicht: [1, 5], mittel: [2, 10], schwer: [3, 15] };
  const a = randInt(...ranges[difficulty]);
  const b = randInt(1, Math.min(a, ranges[difficulty][1]));
  const a2 = a * a;
  const b2 = b * b;
  const ab2 = 2 * a * b;

  if (pick([true, false])) {
    return {
      question: `Berechne: $(${a} - ${b})^2$`,
      answer: `${a2 - ab2 + b2}`,
      hint: '2. Binomische Formel: $(a-b)^2 = a^2 - 2ab + b^2$',
      explanation: `$(${a}-${b})^2 = ${a}^2 - 2 \\cdot ${a} \\cdot ${b} + ${b}^2 = ${a2} - ${ab2} + ${b2} = ${a2 - ab2 + b2}$`,
      topic: '2. Binomische Formel',
    };
  } else {
    return {
      question: `Multipliziere aus: $(x - ${b})^2$`,
      answer: `x^2 - ${2 * b}x + ${b2}`,
      hint: '2. Binomische Formel: $(a-b)^2 = a^2 - 2ab + b^2$',
      explanation: `$(x-${b})^2 = x^2 - 2 \\cdot x \\cdot ${b} + ${b}^2 = x^2 - ${2 * b}x + ${b2}$`,
      topic: '2. Binomische Formel',
    };
  }
}

function binom3(difficulty) {
  // (a + b)(a - b) = a² - b²
  const ranges = { leicht: [1, 5], mittel: [2, 10], schwer: [3, 15] };
  const a = randInt(...ranges[difficulty]);
  const b = randInt(1, ranges[difficulty][1]);
  const a2 = a * a;
  const b2 = b * b;

  if (pick([true, false])) {
    return {
      question: `Berechne: $(${a} + ${b})(${a} - ${b})$`,
      answer: `${a2 - b2}`,
      hint: '3. Binomische Formel: $(a+b)(a-b) = a^2 - b^2$',
      explanation: `$(${a}+${b})(${a}-${b}) = ${a}^2 - ${b}^2 = ${a2} - ${b2} = ${a2 - b2}$`,
      topic: '3. Binomische Formel',
    };
  } else {
    return {
      question: `Multipliziere aus: $(x + ${b})(x - ${b})$`,
      answer: `x^2 - ${b2}`,
      hint: '3. Binomische Formel: $(a+b)(a-b) = a^2 - b^2$',
      explanation: `$(x+${b})(x-${b}) = x^2 - ${b}^2 = x^2 - ${b2}$`,
      topic: '3. Binomische Formel',
    };
  }
}

// --- Weighted pools per difficulty ---

const BRUCH_TYPES = {
  leicht: [
    [bruchAddSub, 4],
    [bruchMul, 2],
    [bruchDiv, 1],
  ],
  mittel: [
    [bruchAddSub, 2],
    [bruchMul, 3],
    [bruchDiv, 3],
    [bruchGemischt, 1],
  ],
  schwer: [
    [bruchAddSub, 1],
    [bruchMul, 2],
    [bruchDiv, 2],
    [bruchGemischt, 4],
  ],
};

const POTENZ_TYPES = {
  leicht: [
    [potenzBerechne, 4],
    [potenzWurzel, 3],
    [potenzGesetzMul, 1],
  ],
  mittel: [
    [potenzBerechne, 2],
    [potenzWurzel, 2],
    [potenzGesetzMul, 3],
    [potenzGesetzDiv, 2],
    [potenzGesetzPow, 1],
  ],
  schwer: [
    [potenzBerechne, 1],
    [potenzWurzel, 1],
    [potenzGesetzMul, 2],
    [potenzGesetzDiv, 3],
    [potenzGesetzPow, 3],
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
    [kopfAdd, 2],
    [kopfSub, 2],
    [kopfMul, 3],
    [kopfDiv, 3],
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
    [quadratBerechne, 3],
    [quadratWurzel, 3],
    [quadratErkennen, 3],
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
  binomisch: BINOM_TYPES,
};

export function generateLocalQuestion(category, difficulty) {
  const pool = POOLS[category]?.[difficulty];
  if (!pool) throw new Error(`Unbekannte Kategorie/Schwierigkeit: ${category}/${difficulty}`);
  const gen = weightedPick(pool);
  return gen(difficulty);
}
