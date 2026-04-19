import { useState } from 'react';
import { getApiKey, setApiKey, getModel, setModelPref, getMode, setModePref } from '../utils/storage';
import { initGemini, AVAILABLE_MODELS } from '../utils/gemini';

export default function ApiKeyInput({ onReady }) {
  const [key, setKey] = useState(getApiKey());
  const [selectedModel, setSelectedModel] = useState(getModel());
  const [mode, setMode] = useState(getMode());
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setModePref(mode);

    if (mode === 'ai') {
      const trimmed = key.trim();
      if (!trimmed) {
        setError('Bitte API-Key eingeben.');
        return;
      }
      setApiKey(trimmed);
      setModelPref(selectedModel);
      initGemini(trimmed, selectedModel);
    }

    onReady(mode);
  }

  return (
    <div className="api-key-screen">
      <h2>Einstellungen</h2>

      <div className="setup-field">
        <label>Trainingsmodus</label>
        <div className="difficulty-btns">
          <button
            className={mode === 'local' ? 'active' : ''}
            onClick={() => setMode('local')}
          >
            Schnellrechner
          </button>
          <button
            className={mode === 'ai' ? 'active' : ''}
            onClick={() => setMode('ai')}
          >
            KI Rechner
          </button>
        </div>
      </div>

      {mode === 'ai' && (
        <>
          <p>
            Um KI-Aufgaben zu generieren, wird ein Google Gemini API-Key benoetigt.
            <br />
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
            >
              Key erstellen bei Google AI Studio
            </a>
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="API-Key eingeben..."
            />
            <div className="setup-field">
              <label>Modell</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">Speichern</button>
          </form>
        </>
      )}

      {mode === 'local' && (
        <form onSubmit={handleSubmit}>
          <p>Aufgaben werden lokal generiert — kein API-Key noetig.</p>
          <button type="submit">Speichern</button>
        </form>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
