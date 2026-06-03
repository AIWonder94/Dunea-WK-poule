export interface ScoreResult {
  actual: { home: number; away: number }
  predicted: { home: number; away: number }
}

export function calculatePoints(actual: { home: number; away: number }, predicted: { home: number; away: number }): number {
  // 3 points for exact match
  if (predicted.home === actual.home && predicted.away === actual.away) {
    return 3
  }

  // 2 points for correct winner/draw
  const actualWinner = actual.home > actual.away ? 'home' : actual.home < actual.away ? 'away' : 'draw'
  const predictedWinner = predicted.home > predicted.away ? 'home' : predicted.home < predicted.away ? 'away' : 'draw'

  if (actualWinner === predictedWinner) {
    return 2
  }

  // 1 point for participation
  return 1
}

export function getLeaderboard(predictions: Array<{ userId: string; userName: string; points: number | null }>) {
  const scores = new Map<string, { name: string; points: number; exact: number; winner: number; participated: number }>()

  for (const pred of predictions) {
    if (!scores.has(pred.userId)) {
      scores.set(pred.userId, { name: pred.userName, points: 0, exact: 0, winner: 0, participated: 0 })
    }

    const score = scores.get(pred.userId)!
    const points = pred.points ?? 0

    if (points === 3) score.exact++
    else if (points === 2) score.winner++
    else if (points === 1) score.participated++

    score.points += points
  }

  return Array.from(scores.values())
    .sort((a, b) => b.points - a.points)
    .map((score, rank) => ({ ...score, rank: rank + 1 }))
}
