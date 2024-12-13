export const ROUTES = {
  HOME: '/',
  AUTH: {
    SIGNIN: '/signin',
    SIGNUP: '/signup',
    VERIFY: '/verify-request',
  },
  DASHBOARD: {
    HOME: '/dashboard',
    COURTS: '/dashboard/courts',
    PRODUCTS: '/dashboard/products',
    SETTINGS: {
      HOME: '/dashboard/settings',
      COMPANY: '/dashboard/settings/company',
      MEMBERS: '/dashboard/settings/members',
      ACCOUNT: '/dashboard/settings/account',
      PAYMENT_PROCESSOR: '/dashboard/settings/payment-processor',
    },
  },
  UNAUTHORIZED: '/unauthorized',
} as const
