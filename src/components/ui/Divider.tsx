'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import cn from '@/lib/utils/cn'

const dividerVariants = cva(
  // Base styles
  'border-t relative',
  {
    variants: {
      variant: {
        default: 'border-default',
        subtle: 'border-subtle',
        emphasis: 'border-emphasis',
      },
      withLabel: {
        true: 'flex items-center text-center',
        false: 'border-t',
      },
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full border-l border-t-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      withLabel: false,
      orientation: 'horizontal',
    },
  }
)

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  label?: React.ReactNode
  labelPosition?: 'left' | 'center' | 'right'
}

export function Divider({
  className,
  variant,
  withLabel,
  orientation,
  label,
  labelPosition = 'center',
  ...props
}: DividerProps) {
  if (label) {
    const labelAlignClass = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    }[labelPosition]

    return (
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div
            className={cn(dividerVariants({ variant, withLabel, orientation }), className)}
            {...props}
          />
        </div>
        <div className={cn('relative flex', labelAlignClass)}>
          <span
            className={cn(
              'px-2 text-sm text-foreground-muted bg-background-emphasis',
              labelPosition === 'left' && 'pl-0',
              labelPosition === 'right' && 'pr-0'
            )}
          >
            {label}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(dividerVariants({ variant, withLabel: false, orientation }), className)}
      {...props}
    />
  )
}
