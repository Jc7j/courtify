import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '../supabase/client'
import { ROUTES } from '@/constants/routes'
import { AuthorizedUser } from '@/types/auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AuthorizedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password')
        }

        try {
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
            .select(
              `
              id,
              email,
              name,
              company_id,
              active,
              email_verified_at,
              last_login_at,
              created_at,
              updated_at
            `
            )
            .eq('id', authData.user.id)
            .single()

          if (userError || !userData) {
            throw new Error('User not found')
          }

          await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', userData.id)

          return {
            ...userData,
            supabaseAccessToken: session.access_token,
            supabaseRefreshToken: session.refresh_token,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const typedUser = user as AuthorizedUser
        token.supabaseAccessToken = typedUser.supabaseAccessToken
        token.supabaseRefreshToken = typedUser.supabaseRefreshToken
        token.user = {
          id: typedUser.id,
          email: typedUser.email,
          name: typedUser.name,
          company_id: typedUser.company_id,
          active: typedUser.active,
          email_verified_at: typedUser.email_verified_at,
          last_login_at: typedUser.last_login_at,
          created_at: typedUser.created_at,
          updated_at: typedUser.updated_at,
        }
      }

      if (trigger === 'update' && token.supabaseRefreshToken) {
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.refreshSession({
            refresh_token: token.supabaseRefreshToken as string,
          })

          if (error || !session) {
            throw error || new Error('Failed to refresh session')
          }

          token.supabaseAccessToken = session.access_token
          token.supabaseRefreshToken = session.refresh_token
        } catch (error) {
          console.error('Token refresh error:', error)
          return { ...token, error: 'RefreshAccessTokenError' }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.supabaseAccessToken = token.supabaseAccessToken as string
        session.supabaseRefreshToken = token.supabaseRefreshToken as string
        session.user = {
          ...session.user,
          ...(token.user || {}),
        }

        if (token.error === 'RefreshAccessTokenError') {
          session.error = 'RefreshAccessTokenError'
        }
      }
      return session
    },
  },
  pages: {
    signIn: ROUTES.AUTH.SIGNIN,
    error: ROUTES.AUTH.SIGNIN,
  },
  events: {
    async signOut({ token }) {
      if (token?.supabaseAccessToken) {
        await supabase.auth.signOut()
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
