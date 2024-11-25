'use client'

import { useState, useEffect } from 'react'
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
  Input,
} from '@/components/ui'
import { useCourtAvailability } from '@/hooks/useCourtAvailability'
import dayjs from 'dayjs'
import { Calendar, Clock, Trash2 } from 'lucide-react'
import cn from '@/lib/utils/cn'

interface CourtAvailabilityDialogProps {
  availability: CourtAvailability
  isOpen: boolean
  onClose: () => void
  loading?: boolean
  readOnly?: boolean
  isNew?: boolean
}

export function CourtAvailabilityDialog({
  availability,
  isOpen,
  onClose,
  loading = false,
  readOnly = false,
  isNew = false,
}: CourtAvailabilityDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [startTime, setStartTime] = useState(dayjs(availability.start_time).format('HH:mm'))
  const [endTime, setEndTime] = useState(dayjs(availability.end_time).format('HH:mm'))
  const [hasTimeChanges, setHasTimeChanges] = useState(false)

  const { updateAvailability, deleteAvailability, createAvailability } = useCourtAvailability({
    courtNumber: availability.court_number,
    startTime: dayjs(availability.start_time).startOf('day').toISOString(),
    endTime: dayjs(availability.start_time).endOf('day').toISOString(),
  })

  useEffect(() => {
    setStartTime(dayjs(availability.start_time).format('HH:mm'))
    setEndTime(dayjs(availability.end_time).format('HH:mm'))
    setHasTimeChanges(false)
  }, [availability])

  // const handleStatusChange = async (newStatus: AvailabilityStatus) => {
  //   try {
  //     setIsUpdating(true)
  //     await updateAvailability({
  //       courtNumber: availability.court_number,
  //       startTime: availability.start_time,
  //       update: { status: newStatus },
  //     })
  //     success(`Status updated to ${newStatus.toLowerCase()}`)
  //     onClose()
  //   } catch (error) {
  //     ToastError(error instanceof Error ? error.message : 'Failed to update status')
  //   } finally {
  //     setIsUpdating(false)
  //   }
  // }

  const handleTimeChange = async () => {
    try {
      setIsUpdating(true)
      const originalDate = dayjs(availability.start_time).format('YYYY-MM-DD')
      const newStartDateTime = dayjs(`${originalDate}T${startTime}`).toISOString()
      const newEndDateTime = dayjs(`${originalDate}T${endTime}`).toISOString()

      if (dayjs(newEndDateTime).isBefore(dayjs(newStartDateTime))) {
        throw new Error('End time must be after start time')
      }

      await updateAvailability({
        courtNumber: availability.court_number,
        startTime: availability.start_time,
        update: { end_time: newEndDateTime },
      })

      await updateAvailability({
        courtNumber: availability.court_number,
        startTime: availability.start_time,
        update: { start_time: newStartDateTime },
      })

      setHasTimeChanges(false)
      success('Time updated successfully')
      onClose()
    } catch (error) {
      ToastError(error instanceof Error ? error.message : 'Failed to update time')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsUpdating(true)
      await deleteAvailability({
        courtNumber: availability.court_number,
        startTime: availability.start_time,
      })
      success('Availability deleted')
      onClose()
    } catch (error) {
      ToastError(error instanceof Error ? error.message : 'Failed to delete availability')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTimeInputChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value)
    } else {
      setEndTime(value)
    }
    setHasTimeChanges(true)
  }

  const isPast = availability.status === AvailabilityStatus.Past
  // const isBooked = availability.status === AvailabilityStatus.Booked
  // const isAvailable = availability.status === AvailabilityStatus.Available

  const statusStyles = {
    [AvailabilityStatus.Available]: 'text-green-600 dark:text-green-400',
    [AvailabilityStatus.Booked]: 'text-red-600 dark:text-red-400',
    [AvailabilityStatus.Past]: 'text-neutral-500 dark:text-neutral-400',
  }

  const handleCreate = async () => {
    try {
      setIsUpdating(true)
      const originalDate = dayjs(availability.start_time).format('YYYY-MM-DD')
      const newStartDateTime = dayjs(`${originalDate}T${startTime}`).toISOString()
      const newEndDateTime = dayjs(`${originalDate}T${endTime}`).toISOString()

      if (dayjs(newEndDateTime).isBefore(dayjs(newStartDateTime))) {
        throw new Error('End time must be after start time')
      }

      await createAvailability({
        courtNumber: availability.court_number,
        startTime: newStartDateTime,
        endTime: newEndDateTime,
      })

      success('Court time created successfully')
      onClose()
    } catch (error) {
      ToastError(error instanceof Error ? error.message : 'Failed to create court time')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent loading={loading || isUpdating} onOpenAutoFocus={(e) => e.preventDefault()}>
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
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeInputChange('start', e.target.value)}
                className="w-32"
                disabled={readOnly || isPast}
              />
              <span>-</span>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => handleTimeInputChange('end', e.target.value)}
                className="w-32"
                disabled={readOnly || isPast}
              />
              {hasTimeChanges && !readOnly && !isPast && (
                <Button
                  size="sm"
                  onClick={handleTimeChange}
                  disabled={isUpdating}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Save
                </Button>
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className="font-medium">Status: </span>
            <span className={cn('font-medium', statusStyles[availability.status])}>
              {availability.status.charAt(0).toUpperCase() + availability.status.slice(1)}
            </span>
          </div>
        </div>

        <DialogFooter>
          {!isPast && !readOnly && (
            <>
              {isNew ? (
                <Button
                  variant="default"
                  onClick={handleCreate}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  Save
                </Button>
              ) : (
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
