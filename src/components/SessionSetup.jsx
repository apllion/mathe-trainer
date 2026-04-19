import { useState } from 'react';

const CATEGORY_LABELS = {
  kopfrechnen: 'Kopfrechnen',
  quadratzahlen: 'Quadratzahlen',
  bruchrechnung: 'Bruchrechnung',
  potenzrechnung: 'Potenzrechnung & Wurzeln',
  terme: 'Terme & Gleichungen',
  binomisch: 'Binomische Formeln',
  herausforderung: 'Herausforderung',
  zufall: 'Zufall',
};

export default function SessionSetup({ category, onStart, onBack }) {
  const [difficulty, setDifficulty] = useState('mittel');

  return (
    <div className="session-setup">
      <button className="back-btn" onClick={onBack}>
        &larr; Zurueck
      </button>
      <h2>{CATEGORY_LABELS[category]}</h2>

      <div className="setup-field">
        <label>Schwierigkeit</label>
        <div className="difficulty-btns">
          {['leicht', 'mittel', 'schwer'].map((d) => (
            <button
              key={d}
              className={difficulty === d ? 'active' : ''}
              onClick={() => setDifficulty(d)}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        className="start-btn"
        onClick={() => onStart({ difficulty })}
      >
        Training starten
      </button>
    </div>
  );
}
