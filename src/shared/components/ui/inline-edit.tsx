'use client'

import { Check, X } from 'lucide-react'
import * as React from 'react'
import { useCallback, useState, useRef } from 'react'

import { cn } from '@/shared/lib/utils/cn'

import { Button } from './button'
import { Input } from './input'

export interface InlineEditProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Initial value */
  value: string
  /** Callback when save is clicked */
  onSave: (value: string) => Promise<void> | void
  /** Optional label above the input */
  label?: string
  /** Whether the component is in a loading/saving state */
  saving?: boolean
  /** Custom class for the wrapper div */
  wrapperClassName?: string
  /** Whether to show a background in view mode */
  showBackground?: boolean
  /** Custom validation function */
  validate?: (value: string) => boolean | string
}

export const InlineEdit = React.forwardRef<HTMLInputElement, InlineEditProps>(
  (
    {
      value: initialValue,
      onSave,
      label,
      saving = false,
      className,
      wrapperClassName,
      showBackground = true,
      validate,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(initialValue)
    const [error, setError] = useState<string>('')
    const containerRef = useRef<HTMLDivElement>(null)

    const handleSave = useCallback(async () => {
      if (validate) {
        const validationResult = validate(value)
        if (typeof validationResult === 'string') {
          setError(validationResult)
          return
        }
        if (!validationResult) {
          setError('Invalid value')
          return
        }
      }

      try {
        await onSave(value.trim())
        setIsEditing(false)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }, [value, onSave, validate])

    const handleCancel = useCallback(() => {
      setValue(initialValue)
      setIsEditing(false)
      setError('')
    }, [initialValue])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          handleSave()
        } else if (e.key === 'Escape') {
          handleCancel()
        }
      },
      [handleSave, handleCancel]
    )

    const handleBlur = useCallback(
      (e: React.FocusEvent) => {
        // Check if the new focus target is outside the component
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          handleCancel()
        }
      },
      [handleCancel]
    )

    return (
      <div className={cn('space-y-1.5', wrapperClassName)}>
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium">
            {label}
          </label>
        )}
        <div className="relative group" ref={containerRef}>
          {isEditing ? (
            <div className="flex items-center gap-2" onBlur={handleBlur}>
              <Input
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={saving || disabled}
                error={error}
                className={cn('flex-1', className)}
                autoFocus
                {...props}
              />
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || disabled || value === initialValue}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving || disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !disabled && setIsEditing(true)}
              className={cn(
                'rounded-md px-3 py-2 text-sm ring-offset-background',
                'hover:ring-2 hover:ring-ring hover:ring-offset-2',
                showBackground && 'bg-muted',
                !disabled && 'cursor-pointer',
                disabled && 'opacity-60',
                className
              )}
            >
              {value}
            </div>
          )}
        </div>
      </div>
    )
  }
)

InlineEdit.displayName = 'InlineEdit'
