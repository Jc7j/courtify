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
  },
  UNAUTHORIZED: '/unauthorized',
} as const
