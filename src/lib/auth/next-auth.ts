import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '../supabase/client'
import { ROUTES } from '@/constants/routes'
import type { AuthorizedUser } from '@/types/auth'
import { apolloClient } from '../apollo/client'
import { refreshToken } from './token-manager'

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
    async jwt({ token, user, trigger }) {
      if (user) {
        const typedUser = user as AuthorizedUser
        return {
          ...token,
          user: {
            id: typedUser.id,
            email: typedUser.email,
            name: typedUser.name,
            company_id: typedUser.company_id,
          },
          supabaseAccessToken: typedUser.supabaseAccessToken,
          supabaseRefreshToken: typedUser.supabaseRefreshToken,
        }
      }

      if (trigger === 'update' || isTokenExpired(token.supabaseAccessToken)) {
        if (!token.supabaseRefreshToken) {
          return { ...token, error: 'RefreshTokenMissing' }
        }

        const result = await refreshToken(token.supabaseRefreshToken)

        if (result.error || !result.access_token || !result.refresh_token) {
          return { ...token, error: result.error ?? 'RefreshAccessTokenError' }
        }

        return {
          ...token,
          supabaseAccessToken: result.access_token,
          supabaseRefreshToken: result.refresh_token,
          error: undefined,
        }
      }

      return token
    },
    async session({ session, token }) {
      session.user = token.user
      session.supabaseAccessToken = token.supabaseAccessToken
      session.supabaseRefreshToken = token.supabaseRefreshToken
      session.error = token.error
      return session
    },
  },
  events: {
    async signOut() {
      await supabase.auth.signOut()
      await apolloClient.clearStore()
    },
  },
  pages: {
    signIn: ROUTES.AUTH.SIGNIN,
    error: ROUTES.AUTH.SIGNIN,
  },
}

function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true
  try {
    const [, base64Payload] = token.split('.')
    if (!base64Payload) return true

    const payload = JSON.parse(atob(base64Payload))
    if (!payload.exp) return true

    const expiry = payload.exp * 1000 // Convert to milliseconds
    // Add a 1-minute buffer for token refresh
    return Date.now() >= expiry - 60000
  } catch (error) {
    console.error('Error checking token expiry:', error)
    return true
  }
}
