/**
 * Scoring system:
 * - Exact score: 3 points
 * - Correct outcome + correct goal difference: 2 points
 * - Correct outcome only: 1 point
 * - Wrong: 0 points
 */
export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 3;
  }

  const predictedOutcome = Math.sign(predictedHome - predictedAway);
  const actualOutcome = Math.sign(actualHome - actualAway);

  if (predictedOutcome !== actualOutcome) return 0;

  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;

  if (predictedDiff === actualDiff) return 2;

  return 1;
}
