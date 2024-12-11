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
    HISTORY: '/dashboard/history',
    SETTINGS: {
      HOME: '/dashboard/settings',
      COMPANY: '/dashboard/settings/company',
      SECURITY: '/dashboard/settings/security',
      MEMBERS: '/dashboard/settings/members',
      BILLING: '/dashboard/settings/billing',
      ACCOUNT: '/dashboard/settings/account',
      PREFERENCES: '/dashboard/settings/preferences',
      PAYMENT_PROCESSOR: '/dashboard/settings/payment-processor',
    },
  },
  UNAUTHORIZED: '/unauthorized',
} as const
