import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { AuthorizedUser } from './types/auth'
import { ROUTES } from './constants/routes'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const user = token?.user as AuthorizedUser | undefined
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

    if (isOnDashboard) {
      if (!user) {
        return NextResponse.redirect(new URL(ROUTES.AUTH.SIGNUP, req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access to signup page without token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}
