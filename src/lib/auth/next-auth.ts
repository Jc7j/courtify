import { type NextAuthOptions, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/lib/supabase/client'
import { refreshToken } from './token-manager'
import type { JWT } from 'next-auth/jwt'
import type { BaseUser } from '@/types/auth'

interface CustomToken extends JWT {
  user: BaseUser
  supabaseAccessToken: string
  supabaseRefreshToken: string
  exp?: number
  error?: string
}

interface CustomSession extends Session {
  user: BaseUser
  supabaseAccessToken: string
  supabaseRefreshToken?: string
  error?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error || !data?.user) return null

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!userData) return null

        return {
          ...userData,
          supabaseAccessToken: data.session?.access_token,
          supabaseRefreshToken: data.session?.refresh_token,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }): Promise<CustomToken> {
      // Initial sign in
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

      // Token refresh logic
      if (token.supabaseRefreshToken) {
        // Check if token needs refresh (do it a bit before expiry)
        const tokenExpiry = token.exp as number
        const shouldRefresh = Math.floor(Date.now() / 1000) > (tokenExpiry ?? 0) - 60

        if (shouldRefresh || trigger === 'update') {
          try {
            const result = await refreshToken(token.supabaseRefreshToken)

            if (result.error) {
              console.error('Token refresh error:', result.error)
              return { ...token, error: 'RefreshAccessTokenError' }
            }

            // Update token with new values
            return {
              ...token,
              supabaseAccessToken: result.access_token!,
              supabaseRefreshToken: result.refresh_token!,
              exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
              error: undefined,
            }
          } catch (error) {
            console.error('Token refresh failed:', error)
            return { ...token, error: 'RefreshAccessTokenError' }
          }
        }
      }

      return token as CustomToken
    },
    async session({ session, token }): Promise<CustomSession> {
      return {
        ...session,
        user: token.user,
        supabaseAccessToken: token.supabaseAccessToken,
        supabaseRefreshToken: token.supabaseRefreshToken,
        error: token.error,
      }
    },
  },
  events: {
    async signOut() {
      await supabase.auth.signOut()
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
}
