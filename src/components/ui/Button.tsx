'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import cn from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-colors',
    'duration-200',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-600',
          'text-white',
          'hover:bg-primary-700',
          'focus:ring-primary-500',
        ],
        secondary: [
          'bg-primary-100',
          'text-primary-700',
          'hover:bg-primary-200',
          'focus:ring-primary-500',
        ],
        outline: [
          'border',
          'border-default',
          'bg-background-emphasis',
          'text-foreground-default',
          'hover:bg-background-subtle',
          'focus:ring-primary-500',
        ],
        ghost: [
          'text-foreground-subtle',
          'hover:bg-background-subtle',
          'hover:text-foreground-default',
          'focus:ring-primary-500',
        ],
        danger: [
          'bg-error-600',
          'text-white',
          'hover:bg-error-700',
          'focus:ring-error-500',
        ],
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md gap-1.5',
        sm: 'h-8 px-3 text-sm rounded-md gap-2',
        md: 'h-9 px-4 text-sm rounded-lg gap-2',
        lg: 'h-10 px-4 text-base rounded-lg gap-2',
        xl: 'h-11 px-5 text-base rounded-xl gap-2.5',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'cursor-wait',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Button({ 
  className, 
    variant, 
    size, 
    fullWidth,
    loading,
    disabled,
    leftIcon,
    rightIcon,
    children,
    ...props 
  }: ButtonProps, ref: React.Ref<HTMLButtonElement>) {
    const { user } = useUser();
    console.log(user);
    return (
      <button
        className={cn(
          buttonVariants({ 
            variant, 
            size, 
            fullWidth,
            loading,
          }), 
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }

Button.displayName = 'Button'

export { Button, buttonVariants } 

{/* 

// Basic usage
<Button>Click me</Button>

// With variant and size
<Button variant="secondary" size="lg">
  Large Secondary Button
</Button>

// With loading state
<Button loading>
  Submitting...
</Button>

// With icons
<Button 
  leftIcon={<IconComponent />}
  rightIcon={<ArrowRight />}
>
  Continue
</Button>

// Full width button
<Button fullWidth>
  Wide Button
</Button>

// Ghost variant
<Button variant="ghost">
  Cancel
</Button>

// Danger variant
<Button variant="danger">
  Delete
</Button>

*/}
