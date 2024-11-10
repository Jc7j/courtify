'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import cn from '@/lib/utils/cn'

const inputVariants = cva(
  [
    'w-full',
    'border',
    'border-input',
    'bg-background',
    'text-foreground',
    'transition-colors',
    'duration-200',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-ring',
    'focus:border-input',
    'placeholder:text-muted-foreground',
  ],
  {
    variants: {
      inputSize: {
        xs: 'px-2.5 py-1.5 text-xs rounded-md',
        sm: 'px-3 py-2 text-sm rounded-md',
        md: 'px-3.5 py-2.5 text-sm rounded-lg',
        lg: 'px-4 py-3 text-base rounded-lg',
        xl: 'px-4 py-3.5 text-lg rounded-xl',
      },
      state: {
        default: '',
        error: 'border-destructive focus:border-destructive focus:ring-destructive',
        success: 'border-success focus:border-success focus:ring-success',
      },
    },
    defaultVariants: {
      inputSize: 'md',
      state: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  hint?: string
  size?: VariantProps<typeof inputVariants>['inputSize']
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, hint, size, state, ...props }, ref) => {
    const inputState = error ? 'error' : state

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <input
          type={type}
          className={cn(inputVariants({ inputSize: size, state: inputState }), className)}
          ref={ref}
          {...props}
        />

        {(error || hint) && (
          <p className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
