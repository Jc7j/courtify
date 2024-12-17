'use client'

import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ReactNode } from 'react'
import { Toaster as Sonner, toast, ToasterProps as SonnerToasterProps } from 'sonner'

import { cn } from '@/shared/lib/utils/cn'

// Extend the base toast options
interface ExtendedToastOptions {
  classNames?: {
    toast?: string
    description?: string
    actionButton?: string
    cancelButton?: string
    success?: string
    error?: string
    warning?: string
    info?: string
  }
  duration?: number
  icon?: ReactNode
}

// Define our custom props
interface ToasterProps extends Omit<SonnerToasterProps, 'toastOptions'> {
  toastOptions?: ExtendedToastOptions
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            'group toast',
            'group-[.toaster]:bg-background',
            'group-[.toaster]:text-foreground',
            'group-[.toaster]:border-border',
            'group-[.toaster]:shadow-lg'
          ),
          description: cn('group-[.toast]:text-muted-foreground'),
          actionButton: cn(
            'group-[.toast]:bg-primary',
            'group-[.toast]:text-primary-foreground',
            'group-[.toast]:hover:bg-primary/90',
            'group-[.toast]:focus:ring-2',
            'group-[.toast]:focus:ring-ring'
          ),
          cancelButton: cn(
            'group-[.toast]:bg-secondary',
            'group-[.toast]:text-secondary-foreground',
            'group-[.toast]:hover:bg-secondary/80',
            'group-[.toast]:focus:ring-2',
            'group-[.toast]:focus:ring-ring'
          ),
          success: cn('group-[.toast]:border-success/20', 'group-[.toast]:bg-success/10'),
          error: cn('group-[.toast]:border-destructive/20', 'group-[.toast]:bg-destructive/10'),
          warning: cn('group-[.toast]:border-warning/20', 'group-[.toast]:bg-warning/10'),
          info: cn('group-[.toast]:border-primary/20', 'group-[.toast]:bg-primary/10'),
        },
        duration: 5000,
      }}
      {...props}
    />
  )
}

// Custom toast functions with proper icons
const SuccessToast = (message: string, options?: ExtendedToastOptions) => {
  return toast.success(message, {
    ...options,
    icon: <CheckCircle className="h-4 w-4 text-success" />,
  })
}

const ErrorToast = (message: string, options?: ExtendedToastOptions) => {
  return toast.error(message, {
    ...options,
    icon: <XCircle className="h-4 w-4 text-destructive" />,
  })
}

const WarningToast = (message: string, options?: ExtendedToastOptions) => {
  return toast.warning(message, {
    ...options,
    icon: <AlertTriangle className="h-4 w-4 text-warning" />,
  })
}

const InfoToast = (message: string, options?: ExtendedToastOptions) => {
  return toast.info(message, {
    ...options,
    icon: <Info className="h-4 w-4 text-primary" />,
  })
}

export { Toaster, SuccessToast, ErrorToast, WarningToast, InfoToast }

// Usage:
/*
import { success, error, warning, info } from '@/components/ui/sonner'

// Success toast
success('Company created successfully!')

// Error toast
error('Failed to create company')

// Warning toast
warning('Your session is about to expire')

// Info toast
info('New booking available')

// With options
success('Success message', {
  duration: 3000,
  classNames: {
    toast: 'custom-class'
  }
})
*/
