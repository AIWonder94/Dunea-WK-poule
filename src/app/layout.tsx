import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import { Navigation } from '@/components/Navigation'
import { auth } from './auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'WK Poule - Voetbal Voorspellingen',
  description: 'Speel mee met 100 collega\'s en voorspel de WK 2026 wedstrijden',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="nl">
      <body>
        <SessionProvider session={session}>
          <Navigation />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
