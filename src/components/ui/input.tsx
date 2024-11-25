import * as React from 'react'
import cn from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  wrapperClassName?: string
  formatPhoneNumber?: boolean
}

const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '')

  // Format the number as (XXX) XXX-XXXX
  if (numbers.length === 0) return ''
  if (numbers.length <= 3) return `(${numbers}`
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      wrapperClassName,
      disabled,
      formatPhoneNumber: shouldFormatPhone,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for input-label association
    const id = React.useId()

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (shouldFormatPhone && type === 'tel') {
          const formattedValue = formatPhoneNumber(e.target.value)
          e.target.value = formattedValue
        }
        onChange?.(e)
      },
      [shouldFormatPhone, type, onChange]
    )

    return (
      <div className={cn('space-y-2', wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            id={id}
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-8',
              rightIcon && 'pr-8',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            onChange={handleChange}
            value={value}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error or Hint Text */}
        {(error || hint) && (
          <p
            id={error ? `${id}-error` : `${id}-hint`}
            className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}
          >
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
