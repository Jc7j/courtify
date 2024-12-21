'use client'

import { Trash2 } from 'lucide-react'
import { memo, type MouseEvent, type ReactNode } from 'react'

import { useCalendarStore } from '@/features/availability/hooks/useCalendarStore'

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils/cn'
import { AvailabilityStatus } from '@/shared/types/graphql'

import { useCourtAvailability } from '../../hooks/useCourtAvailability'

interface CalendarEventProps {
  availability: {
    court_number: number
    start_time: string
    end_time: string
    status: AvailabilityStatus
    booking?: {
      customer_name: string
      metadata?: Record<string, any>
    } | null
  }
  children: ReactNode
  className?: string
}

export const CalendarEvent = memo(function CalendarEvent({
  availability,
  children,
  className,
}: CalendarEventProps) {
  const { deleteAvailability } = useCourtAvailability()
  const { selectedAvailability } = useCalendarStore()

  if (!availability?.court_number) {
    return null
  }

  const isSelected =
    selectedAvailability?.court_number === availability.court_number &&
    selectedAvailability?.start_time === availability.start_time

  const handleDelete = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await deleteAvailability({
        courtNumber: availability.court_number,
        startTime: availability.start_time,
        status: availability.status,
        endTime: availability.end_time,
      })
    } catch (error) {
      console.error('Failed to delete availability:', error)
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'w-full h-full',
            'rounded-md transition-all duration-300 ease-in-out',
            'cursor-pointer relative',
            'group hover:scale-[1.05] hover:opacity-95 hover:shadow-lg',
            'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background',
            'hover:brightness-110',
            'active:scale-[0.98]',
            isSelected && [
              'scale-[1.02] opacity-95 shadow-lg z-10',
              'ring-2 ring-primary ring-offset-2 ring-offset-background',
              'brightness-110',
            ],
            className
          )}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          className="text-destructive focus:text-destructive flex items-center gap-2"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Availability</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})
