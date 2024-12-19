'use client'

import { useApolloClient } from '@apollo/client'
import { ConnectPaymentDetails } from '@stripe/react-connect-js'
import dayjs from 'dayjs'
import { Calendar, Clock, User, Mail, Phone, Trash2, Save } from 'lucide-react'
import { useState, useCallback, ReactNode, useMemo } from 'react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  SuccessToast,
  ErrorToast,
  Input,
  Separator,
} from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils/cn'
import { AvailabilityStatus, EnhancedAvailability } from '@/shared/types/graphql'

import { AvailabilityClientService } from '../services/availabilityClientService'
import { AvailabilityServerService } from '../services/availabilityServerService'

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
  const client = useApolloClient()
  const [isUpdating, setIsUpdating] = useState(false)
  const [timeEditing, setTimeEditing] = useState(false)
  const [startTime, setStartTime] = useState(dayjs(availability.start_time).format('HH:mm'))
  const [endTime, setEndTime] = useState(dayjs(availability.end_time).format('HH:mm'))
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)

  const availabilityService = useMemo(() => new AvailabilityServerService(client), [client])

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

  const handleTimeUpdate = useCallback(async () => {
    try {
      setIsUpdating(true)
      const date = dayjs(availability.start_time).format('YYYY-MM-DD')
      const newStartTime = dayjs(`${date}T${startTime}`).toISOString()
      const newEndTime = dayjs(`${date}T${endTime}`).toISOString()

      const validation = AvailabilityClientService.validateTimeRange(newStartTime, newEndTime)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      await availabilityService.updateAvailability({
        companyId: availability.company_id,
        courtNumber: availability.court_number,
        startTime: availability.start_time,
        update: {
          start_time: newStartTime,
          end_time: newEndTime,
        },
      })

      SuccessToast('Time updated successfully')
      setTimeEditing(false)
      onClose()
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : 'Failed to update time')
    } finally {
      setIsUpdating(false)
    }
  }, [availability, startTime, endTime, availabilityService, onClose])

  const handleDelete = useCallback(async () => {
    try {
      setIsUpdating(true)
      await availabilityService.deleteAvailability({
        companyId: availability.company_id,
        courtNumber: availability.court_number,
        startTime: availability.start_time,
      })
      SuccessToast('Availability deleted')
      onClose()
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : 'Failed to delete availability')
    } finally {
      setIsUpdating(false)
    }
  }, [availability, availabilityService, onClose])

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

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <span className={cn('font-medium', statusStyles[availability.status])}>
              {availability.status.charAt(0).toUpperCase() + availability.status.slice(1)}
            </span>
          </div>

          {showBookingDetails && availability.booking && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium">Booking Details</h3>

                <Section title="Customer Information">
                  <InfoRow icon={User} value={availability.booking.customer_name} />
                  <InfoRow icon={Mail} value={availability.booking.customer_email} />
                  {availability.booking.customer_phone && (
                    <InfoRow icon={Phone} value={availability.booking.customer_phone} />
                  )}
                </Section>

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

                {(availability.booking.metadata?.products?.equipment?.length > 0 ||
                  availability.booking.metadata?.products?.court_rental) && (
                  <Section title="Products">
                    <ul className="list-disc list-inside space-y-1">
                      {/* Court Rental */}
                      {availability.booking.metadata?.products?.court_rental && (
                        <li className="text-sm">
                          {availability.booking.metadata.products.court_rental.name}
                        </li>
                      )}

                      {/* Equipment */}
                      {availability.booking.metadata?.products?.equipment?.map(
                        (item: { name: string }, i: number) => (
                          <li key={i} className="text-sm">
                            {item.name}
                          </li>
                        )
                      )}
                    </ul>
                  </Section>
                )}

                <Section title="Booking Information">
                  <InfoRow
                    icon={Calendar}
                    label="Created"
                    value={formatDateTime(availability.booking.metadata?.booking_flow?.created_at)}
                  />
                </Section>

                {availability.booking?.metadata?.payment_details?.payment_intent_id && (
                  <>
                    <Separator />
                    <Section title="Payment Details">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 bg-background/50 p-3 rounded-md">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <p
                              className={cn('font-medium text-sm', {
                                'text-green-600': availability.booking.payment_status === 'paid',
                                'text-yellow-600':
                                  availability.booking.payment_status === 'processing',
                                'text-red-600': availability.booking.payment_status === 'failed',
                              })}
                            >
                              {availability.booking.payment_status.charAt(0).toUpperCase() +
                                availability.booking.payment_status.slice(1)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Amount</span>
                            <p className="font-medium text-sm">
                              ${(availability.booking.amount_total / 100).toFixed(2)}
                            </p>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <span className="text-xs text-muted-foreground">Payment Date</span>
                            <p className="text-sm text-muted-foreground">
                              {dayjs(
                                availability.booking.metadata.payment_details.payment_date
                              ).format('MMM D, YYYY h:mm A')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                        className="w-full"
                      >
                        {showPaymentDetails ? 'Hide' : 'View'} Payment Details
                      </Button>

                      {showPaymentDetails && (
                        <div className="bg-muted/50 rounded-md p-4 mt-2">
                          <ConnectPaymentDetails
                            payment={
                              availability.booking.metadata.payment_details.payment_intent_id
                            }
                            onClose={() => setShowPaymentDetails(false)}
                          />
                        </div>
                      )}
                    </Section>
                  </>
                )}
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
