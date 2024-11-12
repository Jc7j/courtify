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

          if (!session?.access_token) {
            throw new Error('Failed to get access token')
          }

          // Get user data
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

          // Update last_login_at
          await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', userData.id)

          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            company_id: userData.company_id,
            active: userData.active,
            email_verified_at: userData.email_verified_at,
            last_login_at: userData.last_login_at,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
            supabaseAccessToken: session.access_token,
          }
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
        const typedUser = user as AuthorizedUser
        token.supabaseAccessToken = typedUser.supabaseAccessToken
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
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.supabaseAccessToken = token.supabaseAccessToken as string
        session.user = {
          ...session.user,
          ...(token.user || {}),
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
    async signOut() {
      await supabase.auth.signOut()
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
