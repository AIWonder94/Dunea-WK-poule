'use client'

import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { formatDate, formatTime, isMatchStarted } from '@/lib/utils'
import { PredictionForm } from './PredictionForm'
import Link from 'next/link'
import Image from 'next/image'

interface MatchCardProps {
  match: {
    id: string
    homeTeam: string
    awayTeam: string
    homeTeamFlag?: string | null
    awayTeamFlag?: string | null
    homeScore: number | null
    awayScore: number | null
    matchDate: Date
    status: string
    round: string
    userPrediction?: { homeScore: number; awayScore: number; points?: number | null } | null
  }
  canEdit: boolean
}

export function MatchCard({ match, canEdit }: MatchCardProps) {
  const started = isMatchStarted(match.matchDate)
  const isFinished = match.status === 'FINISHED'

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Match header */}
          <div className="flex justify-between items-start">
            <div className="text-xs text-slate-500">
              {formatDate(match.matchDate)}
            </div>
            <Badge variant={isFinished ? 'default' : started ? 'secondary' : 'outline'}>
              {isFinished ? 'Afgelopen' : started ? 'Bezig' : 'Komend'}
            </Badge>
          </div>

          {/* Teams */}
          <div className="space-y-2">
            <Link href={`/matches/${match.id}`} className="hover:underline">
              <div className="flex items-center justify-between gap-2 min-h-12">
                {match.homeTeamFlag && (
                  <Image
                    src={match.homeTeamFlag}
                    alt={match.homeTeam}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                )}
                <span className="font-semibold flex-1">{match.homeTeam}</span>
                {isFinished && (
                  <span className="text-lg font-bold">{match.homeScore}</span>
                )}
              </div>
            </Link>

            <Link href={`/matches/${match.id}`} className="hover:underline">
              <div className="flex items-center justify-between gap-2 min-h-12">
                {match.awayTeamFlag && (
                  <Image
                    src={match.awayTeamFlag}
                    alt={match.awayTeam}
                    width={32}
                    height={32}
                    className="rounded"
                  />
                )}
                <span className="font-semibold flex-1">{match.awayTeam}</span>
                {isFinished && (
                  <span className="text-lg font-bold">{match.awayScore}</span>
                )}
              </div>
            </Link>
          </div>

          {/* Current prediction */}
          {match.userPrediction && (
            <div className="bg-blue-50 p-2 rounded text-sm">
              <div className="text-slate-600">Jouw voorspelling:</div>
              <div className="font-semibold">
                {match.userPrediction.homeScore} - {match.userPrediction.awayScore}
              </div>
              {match.userPrediction.points !== null && (
                <div className="text-xs text-slate-600">
                  {match.userPrediction.points === 3
                    ? '✓ Exact!'
                    : match.userPrediction.points === 2
                    ? '✓ Winnaar correct'
                    : '✓ Deelgenomen'}
                  {' '}({match.userPrediction.points} punten)
                </div>
              )}
            </div>
          )}

          {/* Prediction form */}
          {canEdit && !started && (
            <PredictionForm matchId={match.id} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
          )}

          {started && !match.userPrediction && (
            <div className="text-sm text-slate-500 text-center py-2">
              Jammer, voorspelling gesloten
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
