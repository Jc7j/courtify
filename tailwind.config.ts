import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import { colors, spacing, typography, elevation, motion } from './src/styles/theme'

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
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      fontSize: typography.sizes,
      fontWeight: typography.weights,
      lineHeight: typography.lineHeights,
      letterSpacing: typography.tracking,
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
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      transitionTimingFunction: motion.easings,
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
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
