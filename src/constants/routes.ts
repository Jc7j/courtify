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
    SETTINGS: {
      HOME: '/dashboard/settings',
      COMPANY: '/dashboard/settings/company',
      SECURITY: '/dashboard/settings/security',
      MEMBERS: '/dashboard/settings/members',
      BILLING: '/dashboard/settings/billing',
      ACCOUNT: '/dashboard/settings/account',
      PREFERENCES: '/dashboard/settings/preferences',
      PRODUCTS: '/dashboard/settings/products',
    },
  },
  UNAUTHORIZED: '/unauthorized',
} as const
