import { auth } from '@/app/auth'
import { prisma } from '@/lib/db'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { redirect } from 'next/navigation'

export default async function LeaderboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Get all predictions with user info and points
  const predictions = await prisma.prediction.findMany({
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  })

  // Calculate scores per user
  const scoreMap = new Map<
    string,
    { userId: string; userName: string; points: number; exact: number; winner: number; participated: number }
  >()

  for (const pred of predictions) {
    const key = pred.userId
    if (!scoreMap.has(key)) {
      scoreMap.set(key, {
        userId: pred.userId,
        userName: pred.user.name,
        points: 0,
        exact: 0,
        winner: 0,
        participated: 0,
      })
    }

    const score = scoreMap.get(key)!
    const points = pred.points ?? 0

    score.points += points

    if (points === 3) score.exact++
    else if (points === 2) score.winner++
    else if (points === 1) score.participated++
  }

  // Sort by total points and create ranking
  const leaderboard = Array.from(scoreMap.values())
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      rank: index + 1,
      name: entry.userName,
      points: entry.points,
      exact: entry.exact,
      winner: entry.winner,
      participated: entry.participated,
    }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Klassement</h1>
        <p className="text-slate-600 mt-2">
          Volg de punten van alle deelnemers: 3 punten voor exact correct, 2 voor winnaar, 1 voor deelname
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Nog geen voorspellingen ingediend
        </div>
      ) : (
        <LeaderboardTable entries={leaderboard} currentUserId={session.user.id} />
      )}
    </div>
  )
}
