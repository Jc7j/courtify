'use client'

import { CompanyCourtCalendar } from '@/components/courts/CompanyCourtCalendar'
import { Tabs, TabsContent, TabsList, TabsTrigger, Card } from '@/components/ui'
import { useBookings } from '@/hooks/useBookings'
import { useCompanyAvailabilities } from '@/hooks/useCourtAvailability'
import { formatCurrency } from '@/lib/utils/format'
import { CalendarDays, Clock, CheckCircle2, XCircle } from 'lucide-react'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Courts } from '@/types/graphql'

export default function BookingsPage() {
  const { completedBookings, loading: bookingsLoading } = useBookings()
  const [selectedDate, setSelectedDate] = useState({
    start: dayjs().startOf('day').toISOString(),
    end: dayjs().endOf('day').toISOString(),
  })

  const {
    courts,
    availabilities,
    loading: availabilitiesLoading,
  } = useCompanyAvailabilities(selectedDate.start, selectedDate.end)

  const handleDateChange = (start: string, end: string) => {
    setSelectedDate({ start, end })
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your court bookings and view booking history
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar" className="space-x-2">
            <CalendarDays className="h-4 w-4" />
            <span>Calendar View</span>
          </TabsTrigger>
          {/* <TabsTrigger value="history" className="space-x-2">
            <Clock className="h-4 w-4" />
            <span>Booking History</span>
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <CompanyCourtCalendar
            courts={courts as Courts[]}
            availabilities={availabilities}
            loading={availabilitiesLoading}
            onDateChange={handleDateChange}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {bookingsLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-6 w-1/4 bg-muted rounded" />
                  <div className="mt-2 h-4 w-1/3 bg-muted rounded" />
                </Card>
              ))
            ) : completedBookings.length > 0 ? (
              // Bookings list
              completedBookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Court {booking.court_number}</h3>
                        <span className="text-sm text-muted-foreground">
                          {dayjs(booking.start_time).format('MMM D, YYYY')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {dayjs(booking.start_time).format('h:mm A')} - {booking.customer_name} (
                        {booking.customer_email})
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(booking.amount_total / 100, booking.currency)}
                        </p>
                        <div className="flex items-center gap-1 text-sm">
                          {booking.payment_status === 'paid' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-success" />
                              <span className="text-success">Paid</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span className="text-destructive">{booking.payment_status}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              // Empty state
              <Card className="p-8">
                <div className="text-center space-y-2">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="font-medium text-lg">No booking history</h3>
                  <p className="text-sm text-muted-foreground">
                    Completed bookings will appear here
                  </p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
