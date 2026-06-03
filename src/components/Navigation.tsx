'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'

export function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">
            ⚽ WK Poule
          </Link>

          <div className="flex gap-4 items-center">
            {session ? (
              <>
                <Link href="/matches">
                  <Button variant="ghost">Wedstrijden</Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="ghost">Klassement</Button>
                </Link>
                {(session.user as any)?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost">Beheer</Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 border-l pl-4">
                  <span className="text-sm text-slate-600">{session.user?.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    Uitloggen
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Inloggen</Button>
                </Link>
                <Link href="/register">
                  <Button>Registreren</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
