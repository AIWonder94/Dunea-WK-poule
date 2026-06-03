import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare, hash } from 'bcryptjs'
import { prisma } from './db'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')

      if (isOnAuth) {
        return !isLoggedIn
      }

      return isLoggedIn
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          return null
        }

        const isValidPassword = await compare(credentials.password as string, user.password)

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
} satisfies NextAuthConfig

export async function createUser(name: string, email: string, password: string) {
  const hashedPassword = await hash(password, 10)

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })
}

export async function createAdminUser(name: string, email: string, password: string) {
  const hashedPassword = await hash(password, 10)

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
}
