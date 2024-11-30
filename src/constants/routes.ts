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
    COURTS: '/dashboard/courts',
    SETTINGS: '/dashboard/settings',
  },
  UNAUTHORIZED: '/unauthorized',
} as const
