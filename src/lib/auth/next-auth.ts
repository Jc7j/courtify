import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '../supabase/client'
import type { User } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
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

          if (!session?.access_token) {
            throw new Error('Failed to get access token')
          }

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*, companies(*)')
            .eq('id', authData.user.id)
            .single()

          if (userError || !userData) {
            throw new Error('User not found')
          }

          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            company: userData.companies,
            supabaseAccessToken: session.access_token,
            active: userData.active,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
          } as User
        } catch (error) {
          console.error('Authorization error:', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.supabaseAccessToken = user.supabaseAccessToken
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.supabaseAccessToken = token.supabaseAccessToken as string
        session.user = {
          ...session.user,
          ...(token.user as User),
        }
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
