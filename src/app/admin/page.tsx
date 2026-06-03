'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Check admin role
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/matches')
  }

  const handleSync = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(`✓ ${data.created} wedstrijden toegevoegd, ${data.updated} bijgewerkt`)
        router.refresh()
      } else {
        setError(data.error || 'Synchronisatie mislukt')
      }
    } catch (err) {
      setError('Fout bij synchronisatie')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Beheer</h1>

      <Card>
        <CardHeader>
          <CardTitle>WK 2026 Wedstrijden</CardTitle>
          <CardDescription>Synchroniseer wedstrijdschema vanuit TheSportsDB API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Haalt alle WK 2026 wedstrijden en huidige uitslagen op van TheSportsDB.
            </p>
            <p className="text-sm text-slate-600">
              Na synchronisatie worden automatisch punten berekend voor voltooide wedstrijden.
            </p>
          </div>

          {message && (
            <div className="bg-green-50 p-3 rounded text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-3 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleSync}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Synchroniseren...' : 'Synchroniseer Wedstrijden'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Handleiding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">1. Eerste synchronisatie</p>
            <p className="text-slate-600">Klik op de knop hierboven om alle WK 2026 wedstrijden in te laden.</p>
          </div>

          <div>
            <p className="font-semibold mb-1">2. Dagelijks updaten</p>
            <p className="text-slate-600">Druk regelmatig op &quot;Synchroniseer&quot; om uitslagen bij te werken.</p>
          </div>

          <div>
            <p className="font-semibold mb-1">3. Punten berekening</p>
            <p className="text-slate-600">
              Bij elk update worden punten automatisch berekend: 3 voor exact, 2 voor juiste winnaar, 1 voor deelname.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">4. Klassement</p>
            <p className="text-slate-600">Het klassement wordt automatisch bijgewerkt op basis van punten.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
