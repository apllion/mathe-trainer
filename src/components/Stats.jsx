import { getStats } from '../utils/storage';

const LABELS = {
  bruchrechnung: 'Bruchrechnung',
  potenzrechnung: 'Potenzrechnung',
};

export default function Stats() {
  const stats = getStats();

  return (
    <div className="stats-page">
      <h2>Statistik</h2>
      <div className="stats-cards">
        {Object.entries(stats).map(([key, data]) => {
          const accuracy =
            data.totalQuestions > 0
              ? Math.round((data.totalCorrect / data.totalQuestions) * 100)
              : 0;
          return (
            <div key={key} className="stats-card">
              <h3>{LABELS[key]}</h3>
              <div className="stats-row">
                <span>Sessions: {data.sessions}</span>
                <span>
                  Richtig: {data.totalCorrect}/{data.totalQuestions}
                </span>
                <span>Genauigkeit: {accuracy}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
