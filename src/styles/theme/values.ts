import { colors } from '../theme'

export const lightTheme = {
  colors: {
    // Brand colors remain the same in both themes
    'color-primary-50': colors.primary[50],
    'color-primary-100': colors.primary[100],
    'color-primary-200': colors.primary[200],
    'color-primary-300': colors.primary[300],
    'color-primary-400': colors.primary[400],
    'color-primary-500': colors.primary[500],
    'color-primary-600': colors.primary[600],
    'color-primary-700': colors.primary[700],
    'color-primary-800': colors.primary[800],
    'color-primary-900': colors.primary[900],

    // Semantic colors - Light theme
    'background-default': colors.neutral[50],
    'background-subtle': colors.neutral[100],
    'background-muted': colors.neutral[200],
    'background-emphasis': colors.white,

    'foreground-default': colors.neutral[900],
    'foreground-subtle': colors.neutral[700],
    'foreground-muted': colors.neutral[500],
    'foreground-emphasis': colors.white,

    'border-default': colors.neutral[200],
    'border-subtle': colors.neutral[100],
    'border-emphasis': colors.neutral[300],

    'status-success': colors.success[500],
    'status-warning': colors.warning[500],
    'status-error': colors.error[500],
    'status-info': colors.primary[500],
  },
}

export const darkTheme = {
  colors: {
    // Brand colors remain the same
    'color-primary-50': colors.primary[50],
    'color-primary-100': colors.primary[100],
    'color-primary-200': colors.primary[200],
    'color-primary-300': colors.primary[300],
    'color-primary-400': colors.primary[400],
    'color-primary-500': colors.primary[500],
    'color-primary-600': colors.primary[600],
    'color-primary-700': colors.primary[700],
    'color-primary-800': colors.primary[800],
    'color-primary-900': colors.primary[900],

    // Semantic colors - Dark theme
    'background-default': colors.neutral[900],
    'background-subtle': colors.neutral[800],
    'background-muted': colors.neutral[700],
    'background-emphasis': colors.white,

    'foreground-default': colors.neutral[50],
    'foreground-subtle': colors.neutral[200],
    'foreground-muted': colors.neutral[400],
    'foreground-emphasis': colors.neutral[100],

    'border-default': colors.neutral[700],
    'border-subtle': colors.neutral[800],
    'border-emphasis': colors.neutral[600],

    'status-success': colors.success[500],
    'status-warning': colors.warning[500],
    'status-error': colors.error[500],
    'status-info': colors.primary[500],
  },
}
