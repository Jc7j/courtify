'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import cn from '@/lib/utils/cn'

const inputVariants = cva(
  // Base styles
  [
    'w-full',
    'border',
    'border-default',
    'bg-background-emphasis',
    'text-foreground-default',
    'transition-colors',
    'duration-200',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:border-primary-500',
  ],
  {
    variants: {
      inputSize: {
        xs: 'px-2.5 py-1.5 text-xs rounded-md',
        sm: 'px-3 py-2 text-sm rounded-md',
        md: 'px-3.5 py-2.5 text-sm rounded-lg',
        lg: 'px-4 py-3 text-base rounded-lg',
        xl: 'px-4 py-3.5 text-lg rounded-xl'
      },
      state: {
        default: '',
        error: 'border-error-300 focus:border-error-500 focus:ring-error-500',
        success: 'border-success-300 focus:border-success-500 focus:ring-success-500',
      }
    },
    defaultVariants: {
      inputSize: 'md',
      state: 'default'
    }
  }
)

type InputVariants = VariantProps<typeof inputVariants>

// Omit the HTML size attribute to avoid conflicts
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariants {
  label?: string
  error?: string
  hint?: string
  size?: InputVariants['inputSize'] // Add size back as an optional prop
}

function Input({ 
    className, 
    type = 'text', 
    label, 
    error, 
    hint, 
    size, 
    state, 
    ...props 
  }: InputProps, ref: React.Ref<HTMLInputElement>) {
    // If there's an error, override the state
    const inputState = error ? 'error' : state
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-foreground-subtle"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            type={type}
            className={cn(inputVariants({ inputSize: size, state: inputState }), className)}
            ref={ref}
            {...props}
          />
        </div>

        {/* Error or Hint Text */}
        {(error || hint) && (
          <p 
            className={cn(
              "mt-1.5 text-sm",
              error ? "text-status-error" : "text-foreground-muted"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
  )
}

Input.displayName = 'Input'

export { Input, inputVariants }

{/* 

// Basic usage
<Input
  label="Username"
  placeholder="Enter your username"
/>

// With size variant
<Input
  label="Email"
  size="lg"
  placeholder="Enter your email"
/>

// With error state
<Input
  label="Password"
  type="password"
  error="Password is required"
/>

// With hint text
<Input
  label="Username"
  hint="This will be your public display name"
/>

// With success state
<Input
  label="Email"
  state="success"
  value="user@example.com"
/>
*/}
