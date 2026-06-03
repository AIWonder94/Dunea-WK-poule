'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

interface PredictionFormProps {
  matchId: string
  homeTeam: string
  awayTeam: string
  initialHome?: number
  initialAway?: number
}

export function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  initialHome = 0,
  initialAway = 0,
}: PredictionFormProps) {
  const router = useRouter()
  const [homeScore, setHomeScore] = useState(initialHome)
  const [awayScore, setAwayScore] = useState(initialAway)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          homeScore: parseInt(homeScore as any),
          awayScore: parseInt(awayScore as any),
        }),
      })

      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="text-xs text-slate-500">{homeTeam}</label>
        <Input
          type="number"
          min="0"
          max="9"
          value={homeScore}
          onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
          className="w-full"
        />
      </div>
      <span className="font-bold text-slate-400">-</span>
      <div className="flex-1">
        <label className="text-xs text-slate-500">{awayTeam}</label>
        <Input
          type="number"
          min="0"
          max="9"
          value={awayScore}
          onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
          className="w-full"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Bezig...' : 'Opslaan'}
      </Button>
    </form>
  )
}
