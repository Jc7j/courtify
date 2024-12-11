'use client'

import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Button } from '@/components/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import cn from '@/lib/utils/cn'
import { AvailabilityStatus, CourtAvailability } from '@/types/graphql'

interface WeeklyCalendarProps {
  startDate?: Date
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  onWeekChange: (date: Date) => void
  availabilities: CourtAvailability[]
}

export function WeeklyCalendar({
  startDate = new Date(),
  selectedDate,
  onDateSelect,
  onWeekChange,
  availabilities,
}: WeeklyCalendarProps) {
  const dates = useMemo(() => {
    const start = dayjs(startDate).startOf('week')
    return Array.from({ length: 7 }).map((_, i) => start.add(i, 'day'))
  }, [startDate])

  // Create a Set of dates that have future availabilities for O(1) lookup
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    const now = dayjs()

    availabilities.forEach((availability) => {
      // Only add to available dates if:
      // 1. The time hasn't passed yet
      // 2. The status is 'available'
      if (
        dayjs(availability.start_time).isAfter(now) &&
        availability.status === AvailabilityStatus.Available
      ) {
        const date = dayjs(availability.start_time).format('YYYY-MM-DD')
        dates.add(date)
      }
    })
    return dates
  }, [availabilities])

  const handlePrevWeek = () => {
    const prevWeek = dayjs(startDate).subtract(1, 'week')
    if (prevWeek.isAfter(dayjs().startOf('week')) || prevWeek.isSame(dayjs().startOf('week'))) {
      onWeekChange(prevWeek.toDate())
    }
  }

  const handleNextWeek = () => {
    onWeekChange(dayjs(startDate).add(1, 'week').toDate())
  }

  const canGoPrevious =
    dayjs(startDate).subtract(1, 'week').isAfter(dayjs().startOf('week')) ||
    dayjs(startDate).subtract(1, 'week').isSame(dayjs().startOf('week'))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevWeek}
          disabled={!canGoPrevious}
          className={cn(!canGoPrevious && 'opacity-50 cursor-not-allowed')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">{dayjs(dates[0]).format('MMMM YYYY')}</div>
        <Button variant="outline" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          const isSelected = selectedDate && dayjs(selectedDate).isSame(date, 'day')
          const isToday = dayjs().isSame(date, 'day')
          const isPast = date.isBefore(dayjs().startOf('day'))
          const hasAvailability = availableDates.has(date.format('YYYY-MM-DD'))
          const isDisabled = isPast || !hasAvailability

          return (
            <Button
              key={date.toString()}
              variant={isSelected ? 'default' : 'outline'}
              disabled={isDisabled}
              className={cn(
                'relative flex flex-col items-center justify-center h-24 p-2 gap-1',
                'transition-all duration-200',
                'hover:border-primary/50 hover:bg-primary/5',
                isSelected &&
                  'border-primary bg-primary/10 hover:bg-primary/15 ring-1 ring-primary',
                isToday && 'ring-1 ring-primary',
                isDisabled &&
                  'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-border',
                !hasAvailability && 'bg-muted/50'
              )}
              onClick={() => !isDisabled && onDateSelect(date.toDate())}
            >
              <span className={cn('text-sm font-medium', isSelected && 'text-primary')}>
                {date.format('ddd')}
              </span>
              <span
                className={cn(
                  'text-2xl font-semibold',
                  isToday && 'text-primary',
                  isDisabled && 'text-muted-foreground',
                  isSelected && 'text-primary'
                )}
              >
                {date.format('D')}
              </span>
              {!hasAvailability && (
                <span className="text-xs text-muted-foreground mt-1">No courts</span>
              )}
              {hasAvailability && !isDisabled && (
                <span className="text-xs text-primary mt-1">Available</span>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
