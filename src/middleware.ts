import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { ROUTES } from '@/constants/routes'
import { AuthorizedUser } from '@/types/auth'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const user = token?.user as AuthorizedUser
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

    // If user is on dashboard but has no company_id, redirect to create company
    if (isOnDashboard && !user?.company_id) {
      const signupUrl = new URL(ROUTES.AUTH.SIGNUP, req.url)
      signupUrl.searchParams.set('step', 'create-intro')
      return NextResponse.redirect(signupUrl)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
}
