import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import { colors, spacing, typography, elevation, motion, semantic } from './src/styles/theme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors,
      spacing,
      semantic,
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      fontSize: {
        xs: 'typography.sizes.xs',
        sm: 'typography.sizes.sm',
        base: 'typography.sizes.base',
        lg: 'typography.sizes.lg',
        xl: 'typography.sizes.xl',
        '2xl': 'typography.sizes["2xl"]',
        '3xl': 'typography.sizes["3xl"]',
        '4xl': 'typography.sizes["4xl"]',
      },
      fontWeight: typography.weights,
      boxShadow: elevation,
      zIndex: {
        behind: '-1',
        base: '0',
        above: '1',
        modal: '100',
        toast: '200',
        tooltip: '300',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms',
      },
      transitionTimingFunction: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'slide-up': {
          '0%': {
            transform: 'translateY(10px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
      animation: motion.animations,
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [animate],
}

export default config
