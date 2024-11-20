'use client'

import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Button } from '@/components/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import cn from '@/lib/utils/cn'

interface WeeklyCalendarProps {
  startDate?: Date
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  onWeekChange: (date: Date) => void
}

export function WeeklyCalendar({
  startDate = new Date(),
  selectedDate,
  onDateSelect,
  onWeekChange,
}: WeeklyCalendarProps) {
  const dates = useMemo(() => {
    const start = dayjs(startDate).startOf('week')
    return Array.from({ length: 7 }).map((_, i) => start.add(i, 'day'))
  }, [startDate])

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

          return (
            <Button
              key={date.toString()}
              variant="outline"
              disabled={isPast}
              className={cn(
                'flex flex-col items-center justify-center h-20 p-2',
                'hover:bg-primary/10',
                isSelected && 'border-primary bg-primary/10',
                isToday && 'border-primary',
                isPast && 'opacity-50 cursor-not-allowed hover:bg-transparent'
              )}
              onClick={() => !isPast && onDateSelect(date.toDate())}
            >
              <span className="font-medium">{date.format('ddd')}</span>
              <span
                className={cn(
                  'text-2xl',
                  isToday && 'text-primary font-bold',
                  isPast && 'text-muted-foreground'
                )}
              >
                {date.format('D')}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
