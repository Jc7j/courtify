import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { ROUTES } from '@/constants/routes'
import { User } from './types/graphql'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const user = token?.user as User
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

    console.log('user', user)
    // If user is on dashboard but has no company_id, redirect to signup with create-intro step
    if (isOnDashboard && !user?.company_id) {
      const signupUrl = new URL(ROUTES.AUTH.SIGNUP, req.url)
      signupUrl.searchParams.set('step', 'create-intro')
      return NextResponse.redirect(signupUrl)
    } else if (isOnDashboard && user?.company_id) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url))
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
