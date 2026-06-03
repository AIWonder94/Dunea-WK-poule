const BASE = 'https://www.thesportsdb.com/api/v2/json'

export interface SportsDBEvent {
  idEvent: string
  strEvent: string
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore?: number | null
  intAwayScore?: number | null
  dateEvent: string
  strLeague: string
  strSeason: string
  strRound: string
  strGroup: string
  intRound?: number
  strVenue?: string
  strStatus: string
  strCountry?: string
  strHomeTeamBadge?: string
  strAwayTeamBadge?: string
}

export interface SportsDBScheduleResponse {
  results: SportsDBEvent[]
}

export async function fetchWCMatches(eventtype = 'WC'): Promise<SportsDBEvent[]> {
  try {
    const res = await fetch(`${BASE}/eventslast.php?id=133605&type=${eventtype}`)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    return data.results || []
  } catch (error) {
    console.error('Failed to fetch WC matches:', error)
    return []
  }
}

export async function fetchEventById(idEvent: string): Promise<SportsDBEvent | null> {
  try {
    const res = await fetch(`${BASE}/lookupevent.php?id=${idEvent}`)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    return data.results?.[0] || null
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return null
  }
}

export function parseMatchData(event: SportsDBEvent) {
  return {
    externalId: event.idEvent,
    homeTeam: event.strHomeTeam,
    awayTeam: event.strAwayTeam,
    homeTeamFlag: event.strHomeTeamBadge || null,
    awayTeamFlag: event.strAwayTeamBadge || null,
    homeScore: event.intHomeScore !== null && event.intHomeScore !== undefined ? event.intHomeScore : null,
    awayScore: event.intAwayScore !== null && event.intAwayScore !== undefined ? event.intAwayScore : null,
    matchDate: new Date(event.dateEvent),
    stage: parseStage(event.strRound),
    round: event.strRound,
    group: event.strGroup || null,
    venue: event.strVenue || null,
    status: parseStatus(event.strStatus),
  }
}

function parseStage(round: string): string {
  if (round.includes('Group') || round.includes('Group Stage')) return 'Group Stage'
  if (round.includes('16') || round.includes('Round of 16')) return 'Round of 16'
  if (round.includes('Quarter')) return 'Quarter-Final'
  if (round.includes('Semi')) return 'Semi-Final'
  if (round.includes('Final')) return 'Final'
  return round
}

function parseStatus(status: string): 'SCHEDULED' | 'IN_PLAY' | 'FINISHED' {
  if (status === 'Match Finished' || status === 'Match Finished After Extra Time' || status === 'Match Finished After Penalties') {
    return 'FINISHED'
  }
  if (status.includes('In Progress') || status.includes('Playing')) {
    return 'IN_PLAY'
  }
  return 'SCHEDULED'
}
