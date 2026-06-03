'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'

interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  exact: number
  winner: number
  participated: number
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rang</TableHead>
            <TableHead>Naam</TableHead>
            <TableHead className="text-right">Punten</TableHead>
            <TableHead className="text-center">Exact</TableHead>
            <TableHead className="text-center">Winnaar</TableHead>
            <TableHead className="text-center">Deelgenomen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.rank}>
              <TableCell className="font-bold">
                {entry.rank === 1 && '🥇'}
                {entry.rank === 2 && '🥈'}
                {entry.rank === 3 && '🥉'}
                {entry.rank > 3 && entry.rank}
              </TableCell>
              <TableCell className="font-medium">{entry.name}</TableCell>
              <TableCell className="text-right font-bold text-lg">{entry.points}</TableCell>
              <TableCell className="text-center">
                <Badge variant="default">{entry.exact}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">{entry.winner}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{entry.participated}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
