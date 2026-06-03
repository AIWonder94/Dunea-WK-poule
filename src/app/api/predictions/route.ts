import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/db'
import { isMatchStarted } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet geauthenticeerd' }, { status: 401 })
    }

    const { matchId, homeScore, awayScore } = await req.json()

    // Validate input
    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 })
    }

    // Check if match exists and hasn't started
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return NextResponse.json({ error: 'Wedstrijd niet gevonden' }, { status: 404 })
    }

    if (isMatchStarted(match.matchDate)) {
      return NextResponse.json(
        { error: 'Voorspelling niet meer mogelijk - wedstrijd is gestart' },
        { status: 400 }
      )
    }

    // Create or update prediction
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: session.user.id,
          matchId,
        },
      },
      create: {
        userId: session.user.id,
        matchId,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
      },
      update: {
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
      },
    })

    return NextResponse.json(prediction, { status: 200 })
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json({ error: 'Fout bij opslaan' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet geauthenticeerd' }, { status: 401 })
    }

    const predictions = await prisma.prediction.findMany({
      where: { userId: session.user.id },
      include: {
        match: true,
      },
    })

    return NextResponse.json(predictions)
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return NextResponse.json({ error: 'Fout bij ophalen' }, { status: 500 })
  }
}
