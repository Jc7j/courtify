import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/next-auth'

// Use the configured authOptions from lib/auth/next-auth.ts
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
