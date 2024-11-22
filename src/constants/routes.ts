export const ROUTES = {
  HOME: '/',
  AUTH: {
    SIGNIN: '/signin',
    SIGNUP: '/signup',
    VERIFY: '/verify-request',
  },
  DASHBOARD: {
    HOME: '/dashboard',
    ACCOUNT: '/dashboard/account',
    BOOKINGS: '/dashboard/bookings',
    COURTS: '/dashboard/courts',
  },
  UNAUTHORIZED: '/unauthorized',
} as const
