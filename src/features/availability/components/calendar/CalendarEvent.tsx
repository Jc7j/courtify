'use client'

import { Trash2 } from 'lucide-react'
import { memo, type MouseEvent, type ReactNode } from 'react'

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/shared/components/ui'
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
      <ContextMenuTrigger className={className}>{children}</ContextMenuTrigger>
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
