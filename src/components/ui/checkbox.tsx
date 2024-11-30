'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import cn from '@/lib/utils/cn'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base styles
      'h-4 w-4 shrink-0',
      'rounded-sm border',
      'shadow-sm',
      // Colors
      'border-input',
      'bg-background',
      'hover:bg-accent hover:text-accent-foreground',
      // Focus
      'focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      // States
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      // Dark mode
      'dark:border-input',
      'dark:hover:bg-accent dark:hover:text-accent-foreground',
      'dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
