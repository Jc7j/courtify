export const colors = {
  // Primary Colors
  primary: {
    50: '#EEF2FF', // Lightest - Background tints
    100: '#E0E7FF', // Inputs, cards
    200: '#C7D2FE', // Hover states
    300: '#A5B4FC', // Icons
    400: '#818CF8', // Secondary buttons
    500: '#6366F1', // Main brand color
    600: '#4F46E5', // Primary buttons
    700: '#4338CA', // Button hover
    800: '#3730A3', // Active states
    900: '#312E81', // Text on light backgrounds
  },

  white: '#FFFFFF',

  // Success States
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Primary success
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Warning States
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Primary warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error States
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Primary error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Neutral Colors
  neutral: {
    50: '#F8FAFC', // Page backgrounds
    100: '#F1F5F9', // Card backgrounds
    200: '#E2E8F0', // Input backgrounds
    300: '#CBD5E1', // Borders
    400: '#94A3B8', // Disabled text
    500: '#64748B', // Secondary text
    600: '#475569', // Body text
    700: '#334155', // Headings
    800: '#1E293B', // High emphasis text
    900: '#0F172A', // Highest contrast
  },
}

// Semantic Color Mapping
export const semantic = {
  background: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    tertiary: colors.neutral[200],
  },

  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    inverse: colors.neutral[50],
  },

  border: {
    light: colors.neutral[200],
    default: colors.neutral[300],
    strong: colors.neutral[400],
  },

  action: {
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
    secondary: colors.primary[100],
    secondaryHover: colors.primary[200],
  },

  status: {
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.primary[500],
  },
}

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const

export const typography = {
  fonts: {
    sans: ['var(--font-geist-sans)'],
    mono: ['var(--font-geist-mono)'],
  },

  sizes: {
    '3xs': '0.625rem', // 10px
    '2xs': '0.75rem', // 12px
    xs: '0.8125rem', // 13px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  } as const,

  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  } as const,

  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  } as const,

  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  } as const,
} as const

export const radii = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const

export const components = {
  button: {
    base: 'rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
    sizes: {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-6 py-3 text-base',
    },
    variants: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-primary-100 text-primary-700 hover:bg-primary-200 focus:ring-primary-500',
      outline:
        'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500',
      ghost: 'text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500',
      danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    },
  },

  card: {
    base: 'bg-white rounded-lg',
    variants: {
      flat: 'border border-neutral-200',
      raised: 'shadow-md',
      elevated: 'shadow-lg',
    },
  },
} as const

export const elevation = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

export const motion = {
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  animations: {
    fadeIn: 'fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideUp: 'slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideDown: 'slide-down 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideLeft: 'slide-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideRight: 'slide-right 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    spin: 'spin 1s linear infinite',
  },
} as const

// Type exports for better TypeScript support
export type Spacing = typeof spacing
export type Typography = typeof typography
export type Radii = typeof radii
export type Components = typeof components
export type Elevation = typeof elevation
export type Motion = typeof motion
