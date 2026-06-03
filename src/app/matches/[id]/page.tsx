import { auth } from '@/app/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export default async function MatchDetailPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      predictions: {
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!match) {
    return <div className="text-center py-12">Wedstrijd niet gevonden</div>
  }

  const isFinished = match.status === 'FINISHED'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Match header */}
      <Card>
        <CardHeader>
          <CardTitle>{match.homeTeam} vs {match.awayTeam}</CardTitle>
          <CardDescription>
            {formatDate(match.matchDate)} • {match.stage}
            {match.group && ` • ${match.group}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                {match.homeTeamFlag && (
                  <Image
                    src={match.homeTeamFlag}
                    alt={match.homeTeam}
                    width={64}
                    height={64}
                    className="rounded mb-2"
                  />
                )}
                <p className="font-bold text-lg">{match.homeTeam}</p>
              </div>

              {isFinished && (
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    {match.homeScore} - {match.awayScore}
                  </p>
                  <Badge>Afgelopen</Badge>
                </div>
              )}

              <div className="text-center">
                {match.awayTeamFlag && (
                  <Image
                    src={match.awayTeamFlag}
                    alt={match.awayTeam}
                    width={64}
                    height={64}
                    className="rounded mb-2"
                  />
                )}
                <p className="font-bold text-lg">{match.awayTeam}</p>
              </div>
            </div>

            {match.venue && (
              <div className="text-center text-sm text-slate-600">
                📍 {match.venue}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Predictions - only show if match is finished */}
      {isFinished && match.predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Voorspellingen ({match.predictions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {match.predictions.map((pred) => (
                <div
                  key={pred.id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded"
                >
                  <span className="font-medium">{pred.user.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">
                      {pred.homeScore} - {pred.awayScore}
                    </span>
                    {pred.points && (
                      <Badge
                        variant={
                          pred.points === 3 ? 'default' : pred.points === 2 ? 'secondary' : 'outline'
                        }
                      >
                        {pred.points === 3 ? '✓ 3 pts' : pred.points === 2 ? '✓ 2 pts' : '1 pt'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isFinished && (
        <div className="text-center py-8 text-slate-500">
          Voorspellingen worden zichtbaar na afloop van de wedstrijd
        </div>
      )}
    </div>
  )
}
