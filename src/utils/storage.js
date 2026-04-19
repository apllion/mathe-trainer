const API_KEY_KEY = 'math-trainer-gemini-key';
const MODEL_KEY = 'math-trainer-model';
const STATS_KEY = 'math-trainer-stats';

export function getApiKey() {
  return localStorage.getItem(API_KEY_KEY) || '';
}

export function setApiKey(key) {
  localStorage.setItem(API_KEY_KEY, key);
}

export function getMode() {
  return localStorage.getItem('math-trainer-mode') || 'local';
}

export function setModePref(mode) {
  localStorage.setItem('math-trainer-mode', mode);
}

const CATEGORIES_KEY = 'math-trainer-categories';

const ALL_CATEGORIES = ['kopfrechnen', 'quadratzahlen', 'bruchrechnung', 'potenzrechnung', 'terme', 'binomisch'];

export function getEnabledCategories() {
  try {
    const stored = JSON.parse(localStorage.getItem(CATEGORIES_KEY));
    if (stored && Array.isArray(stored)) return stored;
  } catch {}
  return ALL_CATEGORIES;
}

export function setEnabledCategories(cats) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

export function getAllCategories() {
  return ALL_CATEGORIES;
}

export function getModel() {
  return localStorage.getItem(MODEL_KEY) || 'gemini-2.0-flash';
}

export function setModelPref(modelId) {
  localStorage.setItem(MODEL_KEY, modelId);
}

export function getStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || {
      kopfrechnen: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
      quadratzahlen: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
      bruchrechnung: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
      potenzrechnung: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
      binomisch: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
    };
  } catch {
    return {
      kopfrechnen: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
      quadratzahlen: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
      bruchrechnung: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
      potenzrechnung: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
      binomisch: { sessions: 0, totalCorrect: 0, totalQuestions: 0 },
    };
  }
}

export function saveSessionStats(category, correct, total) {
  const stats = getStats();
  if (!stats[category]) stats[category] = { sessions: 0, totalCorrect: 0, totalQuestions: 0 };
  stats[category].sessions += 1;
  stats[category].totalCorrect += correct;
  stats[category].totalQuestions += total;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
