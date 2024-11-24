import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/lib/supabase/client'
import { refreshToken } from './token-manager'

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
    async jwt({ token, user }) {
      if (user) {
        token.user = user
        token.supabaseAccessToken = user.supabaseAccessToken
        token.supabaseRefreshToken = user.supabaseRefreshToken
        return token
      }

      const tokenExpirationTime = token.exp as number
      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = tokenExpirationTime - currentTime

      if (timeUntilExpiry < 300 && token.supabaseRefreshToken) {
        const refreshResult = await refreshToken(token.supabaseRefreshToken)

        if (refreshResult.error) {
          token.error = refreshResult.error
          return token
        }

        if (refreshResult.access_token && refreshResult.refresh_token) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', token.user.id)
            .single()

          if (userData) {
            token.user = userData
          }

          token.supabaseAccessToken = refreshResult.access_token
          token.supabaseRefreshToken = refreshResult.refresh_token
          delete token.error
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
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
}
