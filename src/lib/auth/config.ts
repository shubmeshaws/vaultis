import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db/prisma'
import { Role } from './permissions'
import bcrypt from 'bcryptjs'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Search by email OR name (username)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { name: credentials.email }, // Using email field as a generic "login id"
            ],
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          isActive: (user as any).isActive,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const email = user.email || profile?.email;
        if (!email) return false;

        const allowedDomains = (process.env.ALLOWED_DOMAINS || '').split(',').map(d => d.trim()).filter(Boolean);

        // If no domains are restricted, allow all
        if (allowedDomains.length === 0) return true;

        const domain = email.split('@')[1];

        if (!allowedDomains.includes(domain)) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.isActive = (user as any).isActive
      }

      // If we are triggered by an update, specific check for client-side update() calls
      if (trigger === "update" && session) {
        // handle manual session updates if necessary
      }

      // Always fetch fresh user data to ensure role/active status is current
      if (token.sub) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub },
        }) as any // Cast to any to handle potentially stale type definitions for isActive

        if (freshUser) {
          token.isActive = freshUser.isActive
          token.role = freshUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.isActive = token.isActive as any
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
