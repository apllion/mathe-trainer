import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;
let currentModelId = 'gemini-2.0-flash';

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

export function initGemini(apiKey, modelId) {
  if (modelId) currentModelId = modelId;
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: currentModelId });
}

export function setModel(modelId) {
  currentModelId = modelId;
  if (genAI) {
    model = genAI.getGenerativeModel({ model: currentModelId });
  }
}

export function getCurrentModelId() {
  return currentModelId;
}

export function isInitialized() {
  return model !== null;
}

const PROMPTS = {
  bruchrechnung: (difficulty) => `Generiere eine Aufgabe zur Bruchrechnung.
Schwierigkeit: ${difficulty}

Schwierigkeitsstufen:
- leicht: Einfache Brueche mit kleinen Nennern (2-10), Addition/Subtraktion, Kuerzen
- mittel: Multiplikation/Division von Bruechen, gemischte Zahlen, groessere Nenner (bis 20)
- schwer: Komplexe Ausdruecke mit mehreren Operationen, verschachtelte Brueche, Textaufgaben

Antworte NUR mit einem JSON-Objekt in diesem Format (kein Markdown, kein Codeblock):
{
  "question": "Die Aufgabe als lesbarer Text, z.B. 'Berechne: 3/4 + 2/3'",
  "answer": "Das exakte Ergebnis als Bruch oder ganze Zahl, z.B. '17/12' oder '1 5/12'",
  "hint": "Ein kurzer Hinweis zur Loesung",
  "explanation": "Ausfuehrlicher Loesungsweg Schritt fuer Schritt",
  "topic": "Unterthema, z.B. 'Addition', 'Multiplikation', 'Kuerzen', 'gemischte Zahlen'"
}`,

  potenzrechnung: (difficulty) => `Generiere eine Aufgabe zur Potenzrechnung (einschliesslich Wurzelziehen).
Schwierigkeit: ${difficulty}

Schwierigkeitsstufen:
- leicht: Einfache Potenzen (Basis 2-10, Exponent 2-3), einfache Quadratwurzeln
- mittel: Potenzgesetze anwenden, negative Exponenten, Kubikwurzeln, Basis mit Bruechen
- schwer: Komplexe Ausdruecke mit mehreren Potenzgesetzen, n-te Wurzeln, rationale Exponenten, Vereinfachen

Antworte NUR mit einem JSON-Objekt in diesem Format (kein Markdown, kein Codeblock):
{
  "question": "Die Aufgabe als lesbarer Text, z.B. 'Berechne: 2^5' oder 'Vereinfache: sqrt(48)'",
  "answer": "Das exakte Ergebnis, z.B. '32' oder '4*sqrt(3)'",
  "hint": "Ein kurzer Hinweis zur Loesung",
  "explanation": "Ausfuehrlicher Loesungsweg Schritt fuer Schritt",
  "topic": "Unterthema, z.B. 'Potenzen', 'Wurzeln', 'Potenzgesetze', 'rationale Exponenten'"
}`,
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateQuestion(category, difficulty, maxRetries = 3) {
  if (!model) {
    throw new Error('Gemini nicht initialisiert. Bitte API-Key eingeben.');
  }

  const prompt = PROMPTS[category](difficulty);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Strip markdown code fences if present
      const cleaned = text
        .replace(/^```(?:json)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '');

      return JSON.parse(cleaned);
    } catch (e) {
      const is429 =
        e?.status === 429 ||
        e?.message?.includes('429') ||
        e?.message?.includes('Resource has been exhausted');

      if (is429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.log(`Rate limited, retrying in ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }

      if (is429) {
        throw new Error(
          'Gemini Rate-Limit erreicht. Bitte einige Sekunden warten und erneut versuchen.'
        );
      }

      const is400 =
        e?.status === 400 ||
        e?.message?.includes('400') ||
        e?.message?.includes('API_KEY_INVALID') ||
        e?.message?.includes('INVALID_ARGUMENT');

      if (is400) {
        const err = new Error(
          'Ungültiger API-Key. Bitte prüfen und erneut eingeben.'
        );
        err.invalidKey = true;
        throw err;
      }

      // JSON parse error
      if (e instanceof SyntaxError) {
        if (attempt < maxRetries) {
          await sleep(1000);
          continue;
        }
        throw new Error('Ungueltige Antwort von Gemini. Bitte erneut versuchen.');
      }

      throw e;
    }
  }
}
