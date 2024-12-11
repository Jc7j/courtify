'use client'

import { Plus, Calendar, Clock, CalendarDays, Volleyball } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  error as toastError,
  success as toastSuccess,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useCourt } from '@/hooks/useCourt'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { CompanyCourtCalendar } from '@/components/courts/CompanyCourtCalendar'
import { useCompanyAvailabilities } from '@/hooks/useCourtAvailability'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useState } from 'react'
import { Courts } from '@/types/graphql'
import { Card } from '@/components/ui/card'

dayjs.extend(relativeTime)

export default function CourtsPage() {
  const router = useRouter()
  const { courts, loading, error, createCourt, creating, refetch } = useCourt()
  const [selectedDate, setSelectedDate] = useState({
    start: dayjs().startOf('day').toISOString(),
    end: dayjs().endOf('day').toISOString(),
  })

  const {
    courts: availabilityCourts,
    availabilities,
    loading: availabilitiesLoading,
  } = useCompanyAvailabilities(selectedDate.start, selectedDate.end)

  const handleDateChange = (start: string, end: string) => {
    setSelectedDate({ start, end })
  }

  async function handleCreateCourt(name: string) {
    try {
      await createCourt(name)
      toastSuccess('Court created successfully')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to create court')
    }
  }

  function handleCourtClick(courtNumber: number) {
    router.push(`${ROUTES.DASHBOARD.HOME}/courts/${courtNumber}`)
  }

  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-foreground">Courts</h1>
        </div>
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>Failed to load courts. Please try again later.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Court Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage your courts, schedules, and view bookings
        </p>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings" className="space-x-2">
            <CalendarDays className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="courts" className="space-x-2">
            <Volleyball className="h-4 w-4" />
            <span>Courts</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="space-x-2">
            <Clock className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <CompanyCourtCalendar
            courts={availabilityCourts as Courts[]}
            availabilities={availabilities}
            loading={availabilitiesLoading}
            onDateChange={handleDateChange}
          />
        </TabsContent>

        <TabsContent value="courts" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              className="border-primary text-primary"
              onClick={() => handleCreateCourt('New Court')}
              disabled={creating}
            >
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Court
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Court</TableHead>
                  <TableHead>Operating Hours</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-32">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : courts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32">
                      <div className="text-muted-foreground">
                        <p>No courts found</p>
                        <p className="text-sm mt-1">Get started by adding your first court</p>
                        <Button
                          variant="outline"
                          onClick={() => handleCreateCourt('New Court')}
                          className="mt-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Court
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  courts.map((court) => (
                    <TableRow
                      key={court.court_number}
                      onClick={() => handleCourtClick(court.court_number)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors group"
                    >
                      <TableCell>
                        <div className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{court.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>6:00 AM - 11:00 PM</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dayjs(court.updated_at).fromNow()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-1/2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors"
                        >
                          View Schedule
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium">Booking History</h2>
              <p className="text-sm text-muted-foreground mt-1">
                View all past and upcoming bookings
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
