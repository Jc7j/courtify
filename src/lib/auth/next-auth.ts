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

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, companies(*)')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return session;
      }

      return {
        ...session,
        user: {
          ...session.user,
          ...user,
          ...userData,
          company: userData?.companies || null,
        },
      };
    },
    async signIn({ user }) {
      return true;
    },
  },
  pages: {
    signIn: ROUTES.AUTH.SIGNIN,
    error: ROUTES.AUTH.ERROR,
    verifyRequest: ROUTES.AUTH.VERIFY,
  },
  events: {
    async signIn({ user }) {
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
