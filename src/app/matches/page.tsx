import { auth } from '@/app/auth'
import { prisma } from '@/lib/db'
import { MatchCard } from '@/components/MatchCard'
import { redirect } from 'next/navigation'

export default async function MatchesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const matches = await prisma.match.findMany({
    orderBy: { matchDate: 'asc' },
    include: {
      predictions: {
        where: { userId: session.user.id },
        select: { homeScore: true, awayScore: true, points: true },
      },
    },
  })

  // Group matches by stage and round
  const groupedMatches = matches.reduce((acc, match) => {
    const key = `${match.stage}${match.group ? ` - ${match.group}` : ''}`
    if (!acc[key]) acc[key] = []
    acc[key].push(match)
    return acc
  }, {} as Record<string, typeof matches>)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Wedstrijdschema</h1>

      {Object.keys(groupedMatches).length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>Nog geen wedstrijden beschikbaar. Admin kan deze synchroniseren.</p>
        </div>
      ) : (
        Object.entries(groupedMatches).map(([stage, stageMatches]) => (
          <div key={stage}>
            <h2 className="text-xl font-semibold mb-4 text-slate-700">{stage}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stageMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={{
                    id: match.id,
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam,
                    homeTeamFlag: match.homeTeamFlag,
                    awayTeamFlag: match.awayTeamFlag,
                    homeScore: match.homeScore,
                    awayScore: match.awayScore,
                    matchDate: match.matchDate,
                    status: match.status,
                    round: match.round || '',
                    userPrediction: match.predictions[0] || null,
                  }}
                  canEdit={true}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
