'use client'

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import cn from '@/lib/utils/cn'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
  actionLabel: string
  onConfirm: () => void
  loading?: boolean
  variant?: 'default' | 'destructive'
  className?: string
  disableConfirm?: boolean
  disableMessage?: string
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actionLabel,
  onConfirm,
  loading = false,
  variant = 'default',
  className,
  disableConfirm = false,
  disableMessage,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          'gap-0 p-0 border-0 shadow-lg',
          'bg-background dark:bg-background',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <AlertDialogTitle className="text-base font-medium">{title}</AlertDialogTitle>
          <AlertDialogCancel
            className={cn(
              'h-auto w-auto p-0 hover:bg-transparent',
              'text-muted-foreground opacity-70 hover:opacity-100',
              'transition-opacity'
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </AlertDialogCancel>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {description && (
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {description}
            </AlertDialogDescription>
          )}
          {children}
          {disableConfirm && disableMessage && (
            <p className="text-sm text-destructive">{disableMessage}</p>
          )}
        </div>

        {/* Footer */}
        <AlertDialogFooter className="px-6 py-4 border-t">
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={loading || disableConfirm}
            className={cn('w-full', {
              'bg-destructive hover:bg-destructive/90': variant === 'destructive',
            })}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-background" />
            ) : (
              actionLabel
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
