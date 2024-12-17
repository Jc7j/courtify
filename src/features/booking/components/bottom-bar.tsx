'use client'

import { ArrowRight, ChevronLeft } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils/cn'

interface BottomBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onNext?: () => void
  onPrevious?: () => void
  canGoPrevious?: boolean
  canGoNext?: boolean
  nextLabel?: string
  previousLabel?: string
  loading?: boolean
  className?: string
  showDivider?: boolean
}

export function BottomBar({
  className,
  onNext,
  onPrevious,
  canGoPrevious = true,
  canGoNext = true,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  loading = false,
  showDivider = true,
  ...props
}: BottomBarProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-background/80 backdrop-blur-sm',
        'lg:bg-background',
        showDivider && 'border-t',
        className
      )}
      {...props}
    >
      <div className="container flex h-16 items-center justify-end gap-2 px-4 md:px-6">
        {onPrevious && (
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || loading}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {previousLabel}
          </Button>
        )}
        {onNext && (
          <Button
            onClick={onNext}
            disabled={!canGoNext || loading}
            loading={loading}
            className="gap-2"
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Safe area spacing for mobile devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}

// Add a wrapper component for content above the bottom bar
interface BottomBarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function BottomBarContent({ children, className, ...props }: BottomBarContentProps) {
  return (
    <div className={cn('pb-[calc(4rem+env(safe-area-inset-bottom))]', className)} {...props}>
      {children}
    </div>
  )
}
