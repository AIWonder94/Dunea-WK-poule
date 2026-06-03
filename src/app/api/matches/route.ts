import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/db'
import { fetchWCMatches, parseMatchData } from '@/lib/sportsdb'
import { calculatePoints } from '@/lib/scoring'

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { matchDate: 'asc' },
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Fout bij ophalen' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const user = session?.user as any

    // Only admins can sync matches
    if (!user?.id || user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Alleen admins kunnen synchroniseren' }, { status: 403 })
    }

    // Fetch matches from TheSportsDB
    const events = await fetchWCMatches('WC')

    if (!events || events.length === 0) {
      return NextResponse.json({ error: 'Geen wedstrijden gevonden' }, { status: 400 })
    }

    let created = 0
    let updated = 0

    // Sync each match
    for (const event of events) {
      const matchData = parseMatchData(event)

      const existing = await prisma.match.findUnique({
        where: { externalId: matchData.externalId },
      })

      if (existing) {
        // Update existing match with new score if finished
        if (matchData.homeScore !== null && matchData.awayScore !== null && existing.homeScore === null) {
          const updatedMatch = await prisma.match.update({
            where: { id: existing.id },
            data: {
              homeScore: matchData.homeScore,
              awayScore: matchData.awayScore,
              status: matchData.status,
            },
          })

          // Recalculate points for all predictions on this match
          const predictions = await prisma.prediction.findMany({
            where: { matchId: existing.id },
          })

          for (const pred of predictions) {
            const points = calculatePoints(
              { home: matchData.homeScore, away: matchData.awayScore },
              { home: pred.homeScore, away: pred.awayScore }
            )

            await prisma.prediction.update({
              where: { id: pred.id },
              data: { points },
            })
          }
        }
        updated++
      } else {
        // Create new match
        await prisma.match.create({
          data: matchData,
        })
        created++
      }
    }

    return NextResponse.json(
      {
        message: `${created} wedstrijden toegevoegd, ${updated} bijgewerkt`,
        created,
        updated,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Synchronisatie mislukt' }, { status: 500 })
  }
}
