import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { ROUTES } from './constants/routes'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isOnSignInPAge = req.nextUrl.pathname.startsWith('/signin')

    // If user is on dashboard but not authenticated, redirect to signin
    if (isOnDashboard && !token) {
      return NextResponse.redirect(new URL(ROUTES.AUTH.SIGNIN, req.url))
    }

    // If user is authenticated but tries to access auth pages, redirect to dashboard
    if (isOnSignInPAge && token) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => {
        return true // Let the middleware function handle the auth logic
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
}
