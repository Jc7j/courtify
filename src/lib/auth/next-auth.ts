import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '../supabase/client'
import { ROUTES } from '@/constants/routes'
import type { AuthorizedUser } from '@/types/auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AuthorizedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password')
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (authError || !authData.user) {
          throw new Error('Invalid credentials')
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.access_token || !session?.refresh_token) {
          throw new Error('Failed to get session tokens')
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name, company_id')
          .eq('id', authData.user.id)
          .single()

        if (userError || !userData) {
          throw new Error('User not found')
        }

        return {
          id: userData.id,
          email: userData.email,
          name: userData.name || '',
          company_id: userData.company_id || null,
          supabaseAccessToken: session.access_token,
          supabaseRefreshToken: session.refresh_token,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          company_id: user.company_id,
        }
        token.supabaseAccessToken = user.supabaseAccessToken
        token.supabaseRefreshToken = user.supabaseRefreshToken
      }

      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.user.id,
        email: token.user.email,
        name: token.user.name,
        company_id: token.user.company_id,
      }
      session.supabaseAccessToken = token.supabaseAccessToken
      session.supabaseRefreshToken = token.supabaseRefreshToken

      return session
    },
  },
  pages: {
    signIn: ROUTES.AUTH.SIGNIN,
    error: ROUTES.AUTH.SIGNIN,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}
