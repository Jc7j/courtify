import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { ROUTES } from './constants/routes'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Handle auth routes
    if (pathname.startsWith('/signin')) {
      if (token) {
        // If user is authenticated, redirect to dashboard
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD, req.url))
      }
      return NextResponse.next()
    }

    // Handle protected routes
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        // Store the original URL as the callback
        const signInUrl = new URL(ROUTES.AUTH.SIGNIN, req.url)
        signInUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(signInUrl)
      }
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the auth logic
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
}
