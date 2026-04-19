import { useState, useEffect, useRef } from 'react';
import { generateQuestion } from '../utils/gemini';
import { generateLocalQuestion, generateChallengeQuestion, getChallengeLength, generateRandomQuestion } from '../utils/localQuestions';
import { getEnabledCategories } from '../utils/storage';
import { checkAnswer, calculateScore } from '../utils/scoring';
import { saveSessionStats } from '../utils/storage';
import { useTimer } from '../hooks/useTimer';
import DrillResult from './DrillResult';
import MathText from './MathText';

export default function DrillSession({ category, config, mode, onBack, onInvalidKey }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('loading'); // loading, running, reviewing, finished
  const [userAnswer, setUserAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [error, setError] = useState('');
  const [loadingNext, setLoadingNext] = useState(false);
  const [difficulty, setDifficulty] = useState(config.difficulty);
  const { elapsed, start, stop, reset } = useTimer();
  const inputRef = useRef(null);
  const prefetchedRef = useRef(null);
  const difficultyRef = useRef(difficulty);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadQuestion();
  }, []);

  function handleDifficultyChange(d) {
    setDifficulty(d);
    difficultyRef.current = d;
    // Discard prefetch since difficulty changed
    prefetchedRef.current = null;
  }

  const isChallenge = category === 'herausforderung';
  const isRandom = category === 'zufall';
  const enabledCats = useRef(getEnabledCategories());
  const challengeTotal = getChallengeLength(enabledCats.current);
  const indexRef = useRef(0);

  function fetchQuestion() {
    if (isChallenge) {
      return Promise.resolve(generateChallengeQuestion(indexRef.current, difficultyRef.current, enabledCats.current));
    }
    if (isRandom) {
      return Promise.resolve(generateRandomQuestion(difficultyRef.current, enabledCats.current));
    }
    if (mode === 'local') {
      return Promise.resolve(generateLocalQuestion(category, difficultyRef.current));
    }
    return generateQuestion(category, difficultyRef.current);
  }

  async function loadQuestion() {
    setPhase('loading');
    setError('');
    try {
      const q = await fetchQuestion();
      setCurrentQuestion(q);
      setPhase('running');
      reset();
      start();
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (e) {
      if (e.invalidKey) onInvalidKey?.();
      setError(e.message);
      setPhase('loading');
    }
  }

  function handleChoiceSelect(choice) {
    setUserAnswer(choice);
    const timeSpent = stop();
    const isCorrect = checkAnswer(choice, currentQuestion.answer);

    const answer = {
      question: currentQuestion,
      userAnswer: choice,
      isCorrect,
      timeSpent,
    };

    setAnswers((prev) => [...prev, answer]);
    setPhase('reviewing');

    // Pre-fetch next question while user reviews
    if (isChallenge) {
      if (indexRef.current + 1 < challengeTotal) {
        indexRef.current += 1;
        prefetchedRef.current = fetchQuestion().catch(() => null);
      }
    } else {
      indexRef.current += 1;
      prefetchedRef.current = fetchQuestion().catch(() => null);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const timeSpent = stop();
    const isCorrect = checkAnswer(userAnswer, currentQuestion.answer);

    const answer = {
      question: currentQuestion,
      userAnswer: userAnswer.trim(),
      isCorrect,
      timeSpent,
    };

    setAnswers((prev) => [...prev, answer]);
    setPhase('reviewing');

    // Pre-fetch next question while user reviews
    if (isChallenge) {
      if (indexRef.current + 1 < challengeTotal) {
        indexRef.current += 1;
        prefetchedRef.current = fetchQuestion().catch(() => null);
      }
    } else {
      indexRef.current += 1;
      prefetchedRef.current = fetchQuestion().catch(() => null);
    }
  }

  function handleFinish() {
    const { correct, total } = calculateScore(answers);
    saveSessionStats(category, correct, total);
    setPhase('finished');
  }

  async function handleNext() {
    setCurrentIndex((i) => i + 1);
    setUserAnswer('');
    setLoadingNext(true);
    try {
      // Use pre-fetched question if available, otherwise fetch now
      const q = prefetchedRef.current
        ? await prefetchedRef.current
        : await fetchQuestion();
      prefetchedRef.current = null;

      if (!q) throw new Error('Aufgabe konnte nicht geladen werden.');

      setCurrentQuestion(q);
      setPhase('running');
      reset();
      start();
      setLoadingNext(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (e) {
      if (e.invalidKey) onInvalidKey?.();
      setError(e.message);
      setLoadingNext(false);
    }
  }

  if (phase === 'finished') {
    return <DrillResult answers={answers} onBack={onBack} />;
  }

  return (
    <div className="drill-session">
      <div className="drill-header">
        <button className="back-btn" onClick={() => {
          if (answers.length > 0) {
            handleFinish();
          } else {
            onBack();
          }
        }}>
          &larr; Abbrechen
        </button>
        {!isChallenge && (
          <div className="difficulty-btns compact">
            {['leicht', 'mittel', 'schwer'].map((d) => (
              <button
                key={d}
                className={difficulty === d ? 'active' : ''}
                onClick={() => handleDifficultyChange(d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        )}
        <span className="progress">
          {isChallenge ? `${currentIndex + 1} / ${challengeTotal}` : `#${currentIndex + 1}`}
        </span>
        <span className="timer">{elapsed}s</span>
      </div>

      {phase === 'loading' && !error && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Aufgabe wird generiert...</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button onClick={loadQuestion}>Erneut versuchen</button>
        </div>
      )}

      {(phase === 'running' || phase === 'reviewing') && currentQuestion && (
        <div className="question-card">
          {currentQuestion.challengeCategory && (
            <span className="topic-badge challenge-badge">{currentQuestion.challengeCategory}</span>
          )}
          {currentQuestion.topic && (
            <span className="topic-badge">{currentQuestion.topic}</span>
          )}
          <h3 className="question-text"><MathText text={currentQuestion.question} /></h3>

          {phase === 'running' && currentQuestion.choices && (
            <div className="choices">
              <div className="choice-btns">
                {currentQuestion.choices.map((c) => (
                  <button key={c} className="choice-btn" onClick={() => handleChoiceSelect(c)}>
                    <MathText text={c} />
                  </button>
                ))}
              </div>
              {currentQuestion.hint && (
                <details className="hint">
                  <summary>Hinweis</summary>
                  <p><MathText text={currentQuestion.hint} /></p>
                </details>
              )}
            </div>
          )}

          {phase === 'running' && !currentQuestion.choices && (
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Antwort eingeben..."
                autoComplete="off"
              />
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Pruefen
                </button>
                {currentQuestion.hint && (
                  <details className="hint">
                    <summary>Hinweis</summary>
                    <p><MathText text={currentQuestion.hint} /></p>
                  </details>
                )}
              </div>
            </form>
          )}

          {phase === 'reviewing' && (
            <div className="review">
              <div
                className={`result-badge ${answers[answers.length - 1].isCorrect ? 'correct' : 'incorrect'}`}
              >
                {answers[answers.length - 1].isCorrect
                  ? 'Richtig!'
                  : 'Falsch'}
              </div>

              <div className="answer-compare">
                <div>
                  <strong>Deine Antwort:</strong> {userAnswer}
                </div>
                <div>
                  <strong>Richtige Antwort:</strong> <MathText text={currentQuestion.answer} />
                </div>
              </div>

              {currentQuestion.explanation && (
                <div className="explanation">
                  <strong>Loesungsweg:</strong>
                  <p><MathText text={currentQuestion.explanation} /></p>
                </div>
              )}

              <div className="review-actions">
                {isChallenge && currentIndex + 1 >= challengeTotal ? (
                  <button className="next-btn" onClick={handleFinish}>
                    Ergebnis anzeigen
                  </button>
                ) : (
                  <>
                    <button
                      className="next-btn"
                      onClick={handleNext}
                      disabled={loadingNext}
                    >
                      {loadingNext ? 'Lade...' : 'Naechste Aufgabe'}
                    </button>
                    {!isChallenge && (
                      <button
                        className="finish-btn"
                        onClick={handleFinish}
                      >
                        Beenden
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
