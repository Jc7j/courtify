'use client'

import { CourtAvailability } from '@/types/graphql'
import { Clock } from 'lucide-react'
import cn from '@/lib/utils/cn'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { memo, useMemo } from 'react'

dayjs.extend(utc)
dayjs.extend(timezone)

interface AvailabilitySlotProps {
  startTime: string
  endTime: string
  courtCount: number
  selected?: boolean
  onClick?: () => void
}

const AvailabilitySlot = memo(function AvailabilitySlot({
  startTime,
  endTime,
  courtCount,
  selected,
  onClick,
}: AvailabilitySlotProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-md border transition-colors cursor-pointer',
        'hover:bg-accent hover:border-accent',
        selected && 'border-primary bg-primary/5 hover:bg-primary/5 hover:border-primary'
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Clock className={cn('h-4 w-4', selected ? 'text-primary' : 'text-muted-foreground')} />
            <span className={cn('font-medium', selected && 'text-primary')}>
              {dayjs(startTime).utc().local().format('h:mm A')} -{' '}
              {dayjs(endTime).utc().local().format('h:mm A')}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {courtCount} {courtCount === 1 ? 'court' : 'courts'} available
          </span>
        </div>
        <span
          className={cn('text-sm font-medium', selected ? 'text-primary' : 'text-muted-foreground')}
        >
          $30/hr
        </span>
      </div>
    </div>
  )
})

interface CourtAvailabilityListProps {
  selectedDate: Date
  availabilities: CourtAvailability[]
  loading: boolean
  selectedKey?: string
  onSelect: (key: string) => void
}

function CourtAvailabilityListComponent({
  selectedDate,
  availabilities,
  loading,
  selectedKey,
  onSelect,
}: CourtAvailabilityListProps) {
  const { morningSlots, afternoonSlots } = useMemo(() => {
    const now = dayjs().utc()
    const selectedDateUtc = dayjs(selectedDate).utc().startOf('day')

    // Filter and group availabilities
    const groupedSlots = availabilities
      .filter((availability) => {
        const availabilityStart = dayjs(availability.start_time).utc()
        return availabilityStart.isSame(selectedDateUtc, 'day') && availabilityStart.isAfter(now)
      })
      .reduce(
        (groups, availability) => {
          const key = `${availability.start_time}-${availability.end_time}`
          if (!groups[key]) {
            groups[key] = {
              startTime: availability.start_time,
              endTime: availability.end_time,
              courtCount: 1,
            }
          } else {
            groups[key].courtCount++
          }
          return groups
        },
        {} as Record<string, { startTime: string; endTime: string; courtCount: number }>
      )

    // Sort and split into morning/afternoon
    const slots = Object.entries(groupedSlots).sort(([, a], [, b]) =>
      dayjs(a.startTime).diff(dayjs(b.startTime))
    )

    return {
      morningSlots: slots.filter(([, slot]) => dayjs(slot.startTime).utc().local().hour() < 12),
      afternoonSlots: slots.filter(([, slot]) => dayjs(slot.startTime).utc().local().hour() >= 12),
    }
  }, [availabilities, selectedDate])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={`loading-${i}`} className="h-16 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    )
  }

  if (morningSlots.length === 0 && afternoonSlots.length === 0) {
    const isToday = dayjs(selectedDate).utc().isSame(dayjs().utc(), 'day')
    const message = isToday
      ? 'No more available times today'
      : `No available times for ${dayjs(selectedDate).format('MMMM D, YYYY')}`

    return <div className="text-center text-muted-foreground py-8">{message}</div>
  }

  const TimeGroup = ({ title, slots }: { title: string; slots: typeof morningSlots }) => {
    if (slots.length === 0) return null
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {slots.map(([key, slot]) => (
          <AvailabilitySlot
            key={key}
            {...slot}
            selected={key === selectedKey}
            onClick={() => onSelect(key)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <TimeGroup title="Morning" slots={morningSlots} />
      <TimeGroup title="Afternoon" slots={afternoonSlots} />
    </div>
  )
}

export const CourtAvailabilityList = memo(CourtAvailabilityListComponent)
