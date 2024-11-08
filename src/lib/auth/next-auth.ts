import { NextAuthOptions } from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '../supabase/client'
import { ROUTES } from '@/constants/routes'
import { User, Company } from '@/types/graphql'

// Extend User type to include company relationship
interface UserWithCompany extends User {
  company: Company | null
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET')
}

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
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

        // Verify with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (authError || !authData.user) {
          throw new Error('Invalid credentials')
        }

        // Get user data from our database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, companies(*)')
          .eq('id', authData.user.id)
          .single()

        if (userError || !userData) {
          throw new Error('User not found')
        }

        // Return user data with proper typing
        return {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          company: userData.companies,
          active: userData.active,
          company_id: userData.company_id,
          last_login_at: userData.last_login_at,
          email_verified_at: userData.email_verified_at,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        } as UserWithCompany
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as UserWithCompany
      }
      return token
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = {
          ...session.user,
          ...(token.user as UserWithCompany),
        }
      }
      return session
    },
  },
  pages: {
    signIn: ROUTES.AUTH.SIGNIN,
    error: ROUTES.AUTH.ERROR,
  },
  events: {
    async signIn({ user }) {
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

// Use the existing type augmentation from auth.ts
// The type augmentation is already handled in @/types/auth.ts
