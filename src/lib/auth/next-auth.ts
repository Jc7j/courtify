import { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from "@auth/supabase-adapter";
import EmailProvider from "next-auth/providers/email";
import { supabase } from '../supabase/client';
import { ROUTES } from '@/constants/routes';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET');
}

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session?.user) return session;

      const { data: adminData, error } = await supabase
        .from('admins')
        .select('*, companies(*)')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching admin data:', error);
        return session;
      }

      return {
        ...session,
        user: {
          ...session.user,
          ...user,
          isAdmin: !!adminData,
          adminData: adminData || null,
        },
      };
    },
    async signIn({ user }) {
      return true; // Allow all sign-ins
    },
  },
  pages: {
    signIn: '/signin',
    error: ROUTES.AUTH.ERROR,
    verifyRequest: ROUTES.AUTH.VERIFY,
  },
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
