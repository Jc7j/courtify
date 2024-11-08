import { colors, semantic, typography, spacing, components, elevation, motion } from '../theme'

export const themeConfig = {
  colors,
  semantic,
  typography,
  spacing,
  components,
  elevation,
  motion,

  // Theme-specific values
  light: {
    background: {
      default: 'var(--background-default)',
      subtle: 'var(--background-subtle)',
      muted: 'var(--background-muted)',
      emphasis: 'var(--background-emphasis)',
    },
    foreground: {
      default: 'var(--foreground-default)',
      subtle: 'var(--foreground-subtle)',
      muted: 'var(--foreground-muted)',
      emphasis: 'var(--foreground-emphasis)',
    },
    border: {
      default: 'var(--border-default)',
      subtle: 'var(--border-subtle)',
      emphasis: 'var(--border-emphasis)',
    },
  },

  dark: {
    // Dark theme values are handled via CSS variables
    // This ensures consistent access patterns regardless of theme
    background: {
      default: 'var(--background-default)',
      subtle: 'var(--background-subtle)',
      muted: 'var(--background-muted)',
      emphasis: 'var(--background-emphasis)',
    },
    foreground: {
      default: 'var(--foreground-default)',
      subtle: 'var(--foreground-subtle)',
      muted: 'var(--foreground-muted)',
      emphasis: 'var(--foreground-emphasis)',
    },
    border: {
      default: 'var(--border-default)',
      subtle: 'var(--border-subtle)',
      emphasis: 'var(--border-emphasis)',
    },
  },
}

export type ThemeConfig = typeof themeConfig
