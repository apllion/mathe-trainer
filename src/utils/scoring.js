export function normalizeAnswer(str) {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\*\*/g, '^')
    .toLowerCase();
}

export function checkAnswer(userAnswer, correctAnswer) {
  const userNorm = normalizeAnswer(userAnswer);
  const correctNorm = normalizeAnswer(correctAnswer);

  // Exact match
  if (userNorm === correctNorm) return true;

  // Numeric comparison with tolerance
  const userNum = parseFloat(userNorm);
  const correctNum = parseFloat(correctNorm);
  if (!isNaN(userNum) && !isNaN(correctNum)) {
    if (correctNum === 0) return Math.abs(userNum) < 0.001;
    return Math.abs(userNum - correctNum) / Math.abs(correctNum) <= 0.02;
  }

  return false;
}

export function calculateScore(answers) {
  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const accuracy = total > 0 ? correct / total : 0;
  const avgTime =
    total > 0 ? answers.reduce((s, a) => s + a.timeSpent, 0) / total : 0;
  const speedBonus = Math.max(0, 1 - avgTime / 60);
  const score = Math.round((accuracy * 0.7 + speedBonus * 0.3) * 100);

  return { total, correct, accuracy, avgTime, score };
}
