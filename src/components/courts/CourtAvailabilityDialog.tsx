'use client'

import { useState, ReactNode } from 'react'
import { AvailabilityStatus, EnhancedAvailability } from '@/types/graphql'
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
  Separator,
} from '@/components/ui'
import { useCourtAvailability } from '@/hooks/useCourtAvailability'
import dayjs from 'dayjs'
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Trash2,
  Save,
  DollarSign,
  Receipt,
  CreditCard,
} from 'lucide-react'
import cn from '@/lib/utils/cn'

interface CourtAvailabilityDialogProps {
  availability: EnhancedAvailability
  isOpen: boolean
  onClose: () => void
  loading?: boolean
  readOnly?: boolean
}

function InfoRow({
  icon: Icon,
  label,
  value,
  variant = 'default',
}: {
  icon: any
  label?: string
  value: string | ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'muted'
}) {
  const variantStyles = {
    default: 'text-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    muted: 'text-muted-foreground',
  }

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      {label ? (
        <div className="flex gap-2">
          <span className="text-muted-foreground">{label}:</span>
          <span className={cn(variantStyles[variant])}>{value}</span>
        </div>
      ) : (
        <span className={cn(variantStyles[variant])}>{value}</span>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="text-sm space-y-1">{children}</div>
    </div>
  )
}

const formatDateTime = (date: string) => dayjs(date).format('MMM D, YYYY h:mm A')
const formatDate = (date: string) => dayjs(date).format('dddd, MMMM D, YYYY')

export function CourtAvailabilityDialog({
  availability,
  isOpen,
  onClose,
  loading = false,
  readOnly = false,
}: CourtAvailabilityDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [timeEditing, setTimeEditing] = useState(false)
  const [startTime, setStartTime] = useState(dayjs(availability.start_time).format('HH:mm'))
  const [endTime, setEndTime] = useState(dayjs(availability.end_time).format('HH:mm'))

  const { deleteAvailability, updateAvailability } = useCourtAvailability({
    courtNumber: availability.court_number,
    startTime: dayjs(availability.start_time).startOf('day').toISOString(),
    endTime: dayjs(availability.start_time).endOf('day').toISOString(),
  })

  const isBooked = availability.status === AvailabilityStatus.Booked
  const isHeld = availability.status === AvailabilityStatus.Held
  const isPast = dayjs(availability.end_time).isBefore(dayjs())
  const showBookingDetails = (isBooked || isHeld) && availability.booking
  const canEdit = !isPast && !readOnly && !isBooked && !isHeld

  const statusStyles = {
    [AvailabilityStatus.Available]: 'text-green-600 dark:text-green-400',
    [AvailabilityStatus.Booked]: 'text-red-600 dark:text-red-400',
    [AvailabilityStatus.Held]: 'text-yellow-600 dark:text-yellow-400',
  }

  async function handleTimeUpdate() {
    try {
      setIsUpdating(true)
      const date = dayjs(availability.start_time).format('YYYY-MM-DD')
      const newStartTime = dayjs(`${date}T${startTime}`).toISOString()
      const newEndTime = dayjs(`${date}T${endTime}`).toISOString()

      if (dayjs(newEndTime).isBefore(dayjs(newStartTime))) {
        throw new Error('End time must be after start time')
      }

      await updateAvailability({
        courtNumber: availability.court_number,
        startTime: availability.start_time,
        update: {
          start_time: newStartTime,
          end_time: newEndTime,
        },
      })

      success('Time updated successfully')
      setTimeEditing(false)
      onClose()
    } catch (error) {
      ToastError(error instanceof Error ? error.message : 'Failed to update time')
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDelete() {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent loading={loading || isUpdating}>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">{formatDate(availability.start_time)}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Time Section */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {timeEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-32"
                />
                <span>-</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-32"
                />
                <Button
                  size="sm"
                  onClick={handleTimeUpdate}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>
                  {dayjs(availability.start_time).format('h:mm A')} -{' '}
                  {dayjs(availability.end_time).format('h:mm A')}
                </span>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTimeEditing(true)}
                    className="h-6 px-2"
                  >
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <span className={cn('font-medium', statusStyles[availability.status])}>
              {availability.status.charAt(0).toUpperCase() + availability.status.slice(1)}
            </span>
          </div>

          {/* Booking Details */}
          {showBookingDetails && availability.booking && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium">Booking Details</h3>

                {/* Customer Info */}
                <Section title="Customer Information">
                  <InfoRow icon={User} value={availability.booking.customer_name} />
                  <InfoRow icon={Mail} value={availability.booking.customer_email} />
                  {availability.booking.customer_phone && (
                    <InfoRow icon={Phone} value={availability.booking.customer_phone} />
                  )}
                </Section>

                {/* Court Details */}
                <Section title="Court Details">
                  <InfoRow
                    icon={Clock}
                    label="Duration"
                    value={`${availability.booking.metadata?.court_details?.duration_hours} hours`}
                  />
                  <InfoRow
                    icon={User}
                    label="Net Height"
                    value={availability.booking.metadata?.customer_preferences?.net_height}
                  />
                </Section>

                {/* Products */}
                {(availability.booking.metadata?.products?.equipment?.length > 0 ||
                  availability.booking.metadata?.products?.court_product) && (
                  <Section title="Products">
                    {/* Court Product */}
                    {availability.booking.metadata?.products?.court_product && (
                      <InfoRow
                        icon={Receipt}
                        label="Court Product"
                        value={availability.booking.metadata.products.court_product}
                      />
                    )}

                    {/* Equipment */}
                    {availability.booking.metadata?.products?.equipment?.length > 0 && (
                      <div className="mt-2">
                        <h5 className="text-sm text-muted-foreground mb-1">Equipment:</h5>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                          {availability.booking.metadata.products.equipment.map(
                            (item: string, i: number) => (
                              <li key={i} className="text-sm">
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </Section>
                )}

                {/* Booking Flow Info */}
                <Section title="Booking Information">
                  <InfoRow
                    icon={Calendar}
                    label="Created"
                    value={formatDateTime(availability.booking.metadata?.booking_flow?.created_at)}
                  />
                </Section>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {canEdit && !timeEditing && (
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
