'use client'

import { useState } from 'react'
import { AvailabilityStatus, CourtAvailability } from '@/types/graphql'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  success,
  error as ToastError,
} from '@/components/ui'
import dayjs from 'dayjs'
import { Calendar, Clock, Trash2 } from 'lucide-react'
import cn from '@/lib/utils/cn'

interface CourtAvailabilityDialogProps {
  availability: CourtAvailability
  isOpen: boolean
  onClose: () => void
  onStatusChange: (newStatus: AvailabilityStatus) => Promise<void>
  onDelete: () => Promise<void>
  loading?: boolean
}

export function CourtAvailabilityDialog({
  availability,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  loading = false,
}: CourtAvailabilityDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    try {
      setIsUpdating(true)
      console.log('Changing status to:', newStatus)
      await onStatusChange(newStatus)
      success(`Status updated to ${newStatus.toLowerCase()}`)
      onClose()
    } catch (error) {
      console.error('Status update error:', error)
      ToastError(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsUpdating(true)
      await onDelete()
    } finally {
      setIsUpdating(false)
    }
  }

  const isPast = availability.status === AvailabilityStatus.Past
  const isBooked = availability.status === AvailabilityStatus.Booked
  const isAvailable = availability.status === AvailabilityStatus.Available

  const statusStyles = {
    [AvailabilityStatus.Available]: 'text-green-600 dark:text-green-400',
    [AvailabilityStatus.Booked]: 'text-red-600 dark:text-red-400',
    [AvailabilityStatus.Past]: 'text-neutral-500 dark:text-neutral-400',
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent loading={loading || isUpdating}>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
              <Calendar className="h-5 w-5" />
              <span>{dayjs(availability.start_time).format('dddd, MMMM D, YYYY')}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {dayjs(availability.start_time).format('h:mm A')} -{' '}
              {dayjs(availability.end_time).format('h:mm A')}
            </span>
          </div>
          <div className="mt-2">
            <span className="font-medium">Status: </span>
            <span className={cn('font-medium', statusStyles[availability.status])}>
              {availability.status.charAt(0).toUpperCase() + availability.status.slice(1)}
            </span>
          </div>
        </div>

        <DialogFooter>
          {!isPast && (
            <>
              {isAvailable && (
                <Button
                  variant="default"
                  onClick={() => handleStatusChange(AvailabilityStatus.Booked)}
                  disabled={isUpdating}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Mark as Booked
                </Button>
              )}
              {isBooked && (
                <Button
                  variant="default"
                  onClick={() => handleStatusChange(AvailabilityStatus.Available)}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Mark as Available
                </Button>
              )}
            </>
          )}
          {!isPast && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isUpdating}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
