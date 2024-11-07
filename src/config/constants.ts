export const APP_CONFIG = {
  BOOKING: {
    MIN_DURATION: 60, // minutes
    MAX_DURATION: 180, // minutes
    INTERVAL: 30, // minutes
    ADVANCE_BOOKING_LIMIT: 30, // days
  },
  DATE_FORMAT: {
    DISPLAY: 'MMM dd, yyyy',
    TIME: 'HH:mm',
    API: 'yyyy-MM-dd',
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
} as const;

export const ROUTES = {
  AUTH: {
    SIGN_IN: '/auth/signin',
    SIGN_UP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  ADMIN: {
    DASHBOARD: '/dashboard',
    SETTINGS: '/settings',
  },
  USER: {
    PROFILE: '/profile',
    BOOKINGS: '/bookings',
  },
} as const; 
