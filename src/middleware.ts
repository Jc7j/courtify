import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isOnboarding = req.nextUrl.pathname.startsWith('/onboarding')
    
    // Allow access to onboarding only for non-admin users
    if (isOnboarding && token?.adminData) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // Redirect non-admin users to onboarding
    if (!isOnboarding && !token?.adminData) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*']
}
