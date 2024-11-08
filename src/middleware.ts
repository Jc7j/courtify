import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { ROUTES } from '@/constants/routes'
import { User } from './types/graphql'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const user = token?.user as User
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

    // If user is on dashboard but has no company_id, redirect to signup with join-or-create step
    if (isOnDashboard && !user?.company_id) {
      const signupUrl = new URL(ROUTES.AUTH.SIGNUP, req.url)
      signupUrl.searchParams.set('step', 'join-or-create')
      return NextResponse.redirect(signupUrl)
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}
