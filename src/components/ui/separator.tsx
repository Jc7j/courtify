'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import cn from '@/lib/utils/cn'

const separatorVariants = {
  variant: {
    default: 'bg-border',
    subtle: 'bg-muted',
    emphasis: 'bg-accent',
  },
  labelPosition: {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  },
} as const

interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  variant?: keyof typeof separatorVariants.variant
  label?: React.ReactNode
  labelPosition?: keyof typeof separatorVariants.labelPosition
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = 'horizontal',
      decorative = true,
      variant = 'default',
      label,
      labelPosition = 'center',
      ...props
    },
    ref
  ) => {
    if (!label) {
      return (
        <SeparatorPrimitive.Root
          ref={ref}
          decorative={decorative}
          orientation={orientation}
          className={cn(
            'shrink-0',
            separatorVariants.variant[variant],
            orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
            className
          )}
          {...props}
        />
      )
    }

    return (
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn(
              'shrink-0 w-full',
              separatorVariants.variant[variant],
              orientation === 'horizontal' ? 'h-[1px]' : 'h-full w-[1px]',
              className
            )}
            {...props}
          />
        </div>
        <div className={cn('relative flex', separatorVariants.labelPosition[labelPosition])}>
          <span
            className={cn(
              'px-2 text-sm text-muted-foreground bg-background',
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
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

// Export for backward compatibility with existing Divider usage
export const Divider = Separator
