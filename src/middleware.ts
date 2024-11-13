import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    return null // No routing logic, just auth protection
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/signup'],
}
