export const colors = {
  // Primary Colors
  primary: {
    50: '#EEF2FF',   // Lightest - Background tints
    100: '#E0E7FF',  // Inputs, cards
    200: '#C7D2FE',  // Hover states
    300: '#A5B4FC',  // Icons
    400: '#818CF8',  // Secondary buttons
    500: '#6366F1',  // Main brand color
    600: '#4F46E5',  // Primary buttons
    700: '#4338CA',  // Button hover
    800: '#3730A3',  // Active states
    900: '#312E81',  // Text on light backgrounds
  },

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
    50: '#F8FAFC',   // Page backgrounds
    100: '#F1F5F9',  // Card backgrounds
    200: '#E2E8F0',  // Input backgrounds
    300: '#CBD5E1',  // Borders
    400: '#94A3B8',  // Disabled text
    500: '#64748B',  // Secondary text
    600: '#475569',  // Body text
    700: '#334155',  // Headings
    800: '#1E293B',  // High emphasis text
    900: '#0F172A',  // Highest contrast
  }
}

// Semantic Color Mapping
export const semantic = {
  background: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    tertiary: colors.neutral[200]
  },
  
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    inverse: colors.neutral[50]
  },

  border: {
    light: colors.neutral[200],
    default: colors.neutral[300],
    strong: colors.neutral[400]
  },

  action: {
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
    secondary: colors.primary[100],
    secondaryHover: colors.primary[200]
  },

  status: {
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.primary[500]
  }
}

export const typography = {
  fonts: {
    sans: ['var(--font-geist-sans)'],
    mono: ['var(--font-geist-mono)'],
  },
  
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',   // 36px
  },

  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
}

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
}

export const components = {
  button: {
    base: 'rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizes: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    },
    variants: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-primary-100 text-primary-700 hover:bg-primary-200 focus:ring-primary-500',
      outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500'
    }
  },
  
  input: {
    base: 'block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
    sizes: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }
  },

  card: {
    base: 'bg-white rounded-lg shadow',
    variants: {
      flat: 'border border-neutral-200',
      raised: 'shadow-md',
      elevated: 'shadow-lg'
    }
  }
}

export const elevation = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
}

export const motion = {
  transitions: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out'
  },
  animations: {
    fadeIn: 'fade-in 250ms ease-in-out',
    slideUp: 'slide-up 350ms ease-in-out',
    bounce: 'bounce 750ms ease-in-out infinite'
  }
}
