import { calculateScore } from '../utils/scoring';

export default function DrillResult({ answers, onBack }) {
  const { total, correct, accuracy, avgTime, score } =
    calculateScore(answers);

  return (
    <div className="drill-result">
      <h2>Ergebnis</h2>

      <div className="score-display">
        <div className="score-circle">
          <span className="score-number">{score}</span>
          <span className="score-label">Punkte</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">
            {correct}/{total}
          </span>
          <span className="stat-label">Richtig</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {Math.round(accuracy * 100)}%
          </span>
          <span className="stat-label">Genauigkeit</span>
        </div>
        <div className="stat">
          <span className="stat-value">{Math.round(avgTime)}s</span>
          <span className="stat-label">&empty; Zeit/Aufgabe</span>
        </div>
      </div>

      <div className="answers-review">
        <h3>Uebersicht</h3>
        {answers.map((a, i) => (
          <div
            key={i}
            className={`answer-item ${a.isCorrect ? 'correct' : 'incorrect'}`}
          >
            <div className="answer-header">
              <span className="answer-icon">
                {a.isCorrect ? '\u2713' : '\u2717'}
              </span>
              <span className="answer-question">
                {a.question.question}
              </span>
              <span className="answer-time">{a.timeSpent}s</span>
            </div>
            {!a.isCorrect && (
              <div className="answer-detail">
                <span>
                  Deine Antwort: <strong>{a.userAnswer}</strong>
                </span>
                <span>
                  Richtig: <strong>{a.question.answer}</strong>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="back-btn-large" onClick={onBack}>
        Neues Training
      </button>
    </div>
  );
}
