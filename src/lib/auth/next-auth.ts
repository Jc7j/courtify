import { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { supabase } from '../supabase/client'
import type { User } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.supabaseAccessToken = user.supabaseAccessToken
        token.user = user as User
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
    async signIn({ user }) {
      if (!user.email) return false

      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, companies(*)')
          .eq('email', user.email)
          .single()

        if (userError || !userData) {
          // Create new user if doesn't exist
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([
              {
                id: user.id,
                email: user.email,
                name: user.name || user.email.split('@')[0],
              },
            ])
            .select('*, companies(*)')
            .single()

          if (createError || !newUser) {
            console.error('Error creating user:', createError)
            return false
          }
        }

        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  debug: process.env.NODE_ENV === 'development',
}
