'use client'

import dayjs from 'dayjs'
import { X, Clock, User, Mail, Phone, Trash2 } from 'lucide-react'
import { memo, useState } from 'react'

import { useCalendarStore } from '@/features/availability/hooks/useCalendarStore'
import { useCourtAvailability } from '@/features/availability/hooks/useCourtAvailability'
import { getStatusClassName } from '@/features/availability/utils/availability-color'

import { Button, Separator, Badge } from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils/cn'
import { AvailabilityStatus } from '@/shared/types/graphql'

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    <div className="flex gap-2">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  </div>
)

const ProductRow = ({
  name,
  price,
  duration,
  showBreakdown,
}: {
  name: string
  price: number
  type: string
  duration?: number
  showBreakdown?: boolean
}) => (
  <div className="flex justify-between items-center py-2">
    <div>
      <span className="font-medium">{name}</span>
      {showBreakdown && (
        <span className="text-muted-foreground">
          {' '}
          (${(price / 100).toFixed(2)}/hour × {duration} hours)
        </span>
      )}
    </div>
    <span className="font-medium">
      ${((showBreakdown ? price * duration! : price) / 100).toFixed(2)}
    </span>
  </div>
)

export const CourtAvailabilityPanel = memo(function CourtAvailabilityPanel() {
  const { selectedAvailability, isPanelOpen, setSelectedAvailability } = useCalendarStore()
  const { deleteAvailability } = useCourtAvailability()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!selectedAvailability || !isPanelOpen) return null

  const formatTime = (date: string) => dayjs(date).format('h:mm A')
  const formatDate = (date: string) => dayjs(date).format('dddd, MMMM D, YYYY')
  const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)}`

  const metadata = selectedAvailability.booking?.metadata
    ? typeof selectedAvailability.booking.metadata === 'string'
      ? JSON.parse(selectedAvailability.booking.metadata)
      : selectedAvailability.booking.metadata
    : null

  const getDurationHours = () => {
    if (!metadata?.court_details?.duration_hours) {
      const start = dayjs(selectedAvailability.start_time)
      const end = dayjs(selectedAvailability.end_time)
      const diffHours = end.diff(start, 'hour', true)
      const hours = Math.floor(diffHours)
      const minutes = Math.round((diffHours - hours) * 60)

      if (hours === 0) {
        return `${minutes} minutes`
      } else if (minutes === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
      } else {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} minutes`
      }
    }
    const hours = parseFloat(metadata.court_details.duration_hours)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  }

  const getFormattedStatus = (status: string | undefined) => {
    if (!status) return 'Unknown'
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteAvailability({
        courtNumber: selectedAvailability.court_number,
        startTime: selectedAvailability.start_time,
        status: selectedAvailability.status,
        endTime: selectedAvailability.end_time,
      })
      setSelectedAvailability(null)
    } catch (error) {
      console.error('Failed to delete availability:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const canDelete =
    selectedAvailability.status === AvailabilityStatus.Available &&
    !dayjs(selectedAvailability.end_time).isBefore(dayjs())

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 w-[400px] bg-background/95 backdrop-blur-sm border-l shadow-lg',
        'transform transition-transform duration-300 ease-in-out z-50',
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Court {selectedAvailability.court_number}</h2>
            <p className="text-sm text-muted-foreground">
              {formatDate(selectedAvailability.start_time)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedAvailability(null)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Time & Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(selectedAvailability.start_time)} -{' '}
                  {formatTime(selectedAvailability.end_time)}
                </span>
              </div>
              <Badge
                variant="secondary"
                className={cn(getStatusClassName(selectedAvailability.status))}
              >
                {getFormattedStatus(selectedAvailability.status)}
              </Badge>
            </div>

            {selectedAvailability.booking && (
              <>
                <Separator />

                {/* Customer Info */}
                <div className="space-y-3">
                  <h3 className="font-medium">Customer Details</h3>
                  <div className="space-y-2">
                    <InfoRow
                      icon={User}
                      label="Name"
                      value={selectedAvailability.booking.customer_name}
                    />
                    <InfoRow
                      icon={Mail}
                      label="Email"
                      value={selectedAvailability.booking.customer_email}
                    />
                    {selectedAvailability.booking.customer_phone && (
                      <InfoRow
                        icon={Phone}
                        label="Phone"
                        value={selectedAvailability.booking.customer_phone}
                      />
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                {metadata && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-medium">Booking Details</h3>
                      <div className="space-y-2">
                        <InfoRow
                          icon={Clock}
                          label="Duration"
                          value={getDurationHours().toString()}
                        />
                        {metadata.customer_preferences?.net_height && (
                          <InfoRow
                            icon={User}
                            label="Net Height"
                            value={metadata.customer_preferences.net_height}
                          />
                        )}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-medium">Payment</h3>
                      <div className="grid grid-cols-2 gap-3 bg-muted/50 p-3 rounded-md">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <p
                            className={cn('font-medium', {
                              'text-green-600':
                                selectedAvailability.booking.payment_status === 'paid',
                              'text-yellow-600':
                                selectedAvailability.booking.payment_status === 'processing',
                              'text-red-600':
                                selectedAvailability.booking.payment_status === 'failed',
                            })}
                          >
                            {selectedAvailability.booking.payment_status.charAt(0).toUpperCase() +
                              selectedAvailability.booking.payment_status.slice(1)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Amount</span>
                          <p className="font-medium">
                            {formatCurrency(selectedAvailability.booking.amount_total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {metadata?.products && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-medium">Products</h3>

                      {/* Court Rental */}
                      {metadata.products.court_rental && (
                        <ProductRow
                          name={metadata.products.court_rental.name}
                          price={metadata.products.court_rental.price_amount}
                          type="Court Rental"
                          duration={parseFloat(metadata.court_details.duration_hours)}
                          showBreakdown={true}
                        />
                      )}

                      {/* Equipment */}
                      {metadata.products.equipment && metadata.products.equipment.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Equipment</span>
                          {metadata.products.equipment.map((item: any, index: number) => (
                            <ProductRow
                              key={`${item.id}-${index}`}
                              name={item.name}
                              price={item.price_amount}
                              type="Equipment"
                            />
                          ))}
                        </div>
                      )}

                      {/* Total */}
                      {selectedAvailability.booking?.amount_total && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Total</span>
                            <span className="font-medium">
                              {formatCurrency(selectedAvailability.booking.amount_total)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
