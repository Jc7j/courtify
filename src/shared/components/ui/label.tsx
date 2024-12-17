'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/lib/utils/cn'

const labelVariants = cva(
  'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50 transition-colors',
  {
    variants: {
      error: {
        true: 'text-destructive',
      },
    },
    defaultVariants: {
      error: false,
    },
  }
)

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  error?: boolean
}

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, error, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref} className={cn(labelVariants({ error, className }))} {...props} />
  )
)

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
export type { LabelProps }
