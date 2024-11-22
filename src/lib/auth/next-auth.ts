import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '../supabase/client'
import { ROUTES } from '@/constants/routes'
import type { AuthorizedUser } from '@/types/auth'
import { apolloClient } from '../apollo/client'

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
        return {
          ...token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            company_id: user.company_id,
          },
          supabaseAccessToken: user.supabaseAccessToken,
          supabaseRefreshToken: user.supabaseRefreshToken,
        }
      }

      if (trigger === 'update' || isTokenExpired(token.supabaseAccessToken)) {
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.refreshSession({
            refresh_token: token.supabaseRefreshToken,
          })

          if (error || !session) {
            console.error('Token refresh error:', error)
            return { ...token, error: 'RefreshAccessTokenError' }
          }

          console.log('Token refreshed successfully')
          return {
            ...token,
            supabaseAccessToken: session.access_token,
            supabaseRefreshToken: session.refresh_token,
            error: undefined,
          }
        } catch (error) {
          console.error('Token refresh error:', error)
          return { ...token, error: 'RefreshAccessTokenError' }
        }
      }

      return token
    },
    async session({ session, token }) {
      session.user = token.user
      session.supabaseAccessToken = token.supabaseAccessToken
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

function isTokenExpired(token: string): boolean {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiry = payload.exp * 1000
    return Date.now() >= expiry - 60000
  } catch {
    return true
  }
}
