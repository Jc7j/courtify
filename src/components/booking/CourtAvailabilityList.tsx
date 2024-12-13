'use client'

import { CourtAvailability } from '@/types/graphql'
import { Clock } from 'lucide-react'
import cn from '@/lib/utils/cn'
import dayjs from 'dayjs'
import { memo, useMemo } from 'react'
import { useGuestStore } from '@/stores/useGuestStore'

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
        'w-full p-4 rounded-md border transition-colors cursor-pointer text-left',
        'border-input hover:border-accent hover:bg-accent/5',
        selected && 'border-primary bg-primary/5 hover:border-primary hover:bg-primary/5'
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Clock className={cn('h-4 w-4', selected ? 'text-primary' : 'text-muted-foreground')} />
            <span className={cn('font-medium', selected ? 'text-primary' : 'text-foreground')}>
              {dayjs(startTime).format('h:mm A')} - {dayjs(endTime).format('h:mm A')}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {courtCount} {courtCount === 1 ? 'court' : 'courts'} available
          </span>
        </div>
      </div>
    </div>
  )
})

interface CourtAvailabilityListProps {
  selectedDate: Date
  availabilities: CourtAvailability[]
  loading: boolean
}

function CourtAvailabilityListComponent({
  selectedDate,
  availabilities,
  loading,
}: CourtAvailabilityListProps) {
  const { selectedAvailability, setSelectedAvailability } = useGuestStore()

  const selectedKey = selectedAvailability
    ? `${selectedAvailability.start_time}-${selectedAvailability.court_number}`
    : undefined

  const { morningSlots, afternoonSlots } = useMemo(() => {
    const now = dayjs()
    const selectedDateLocal = dayjs(selectedDate).startOf('day')

    const filteredAvailabilities = availabilities.filter((availability) => {
      const availabilityStart = dayjs(availability.start_time)
      return (
        availability.status === 'available' &&
        availabilityStart.isSame(selectedDateLocal, 'day') &&
        availabilityStart.isAfter(now)
      )
    })

    const slots = filteredAvailabilities.reduce(
      (groups, availability) => {
        const key = `${availability.start_time}-${availability.end_time}`
        if (!groups[key]) {
          groups[key] = {
            startTime: availability.start_time,
            endTime: availability.end_time,
            courtCount: 1,
            firstAvailability: availability,
          }
        } else {
          groups[key].courtCount++
        }
        return groups
      },
      {} as Record<
        string,
        {
          startTime: string
          endTime: string
          courtCount: number
          firstAvailability: CourtAvailability
        }
      >
    )

    const sortedSlots = Object.entries(slots).sort(([, a], [, b]) =>
      dayjs(a.startTime).diff(dayjs(b.startTime))
    )

    return {
      morningSlots: sortedSlots.filter(([, slot]) => dayjs(slot.startTime).hour() < 12),
      afternoonSlots: sortedSlots.filter(([, slot]) => dayjs(slot.startTime).hour() >= 12),
    }
  }, [availabilities, selectedDate])

  const renderTimeGroup = (title: string, slots: typeof morningSlots) => {
    if (slots.length === 0) return null

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {slots.map(([key, slot]) => {
          const slotKey = `${slot.firstAvailability.start_time}-${slot.firstAvailability.court_number}`
          return (
            <AvailabilitySlot
              key={key}
              startTime={slot.startTime}
              endTime={slot.endTime}
              courtCount={slot.courtCount}
              selected={slotKey === selectedKey}
              onClick={() => {
                console.log('slotKey', slotKey)
                console.log('selectedKey', selectedKey)
                console.log('slot.firstAvailability', slot.firstAvailability)
                setSelectedAvailability(slot.firstAvailability)
              }}
            />
          )
        })}
      </div>
    )
  }

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
    const isToday = dayjs(selectedDate).isSame(dayjs().startOf('day'), 'day')
    const message = isToday
      ? 'No more available times today'
      : `No available times for ${dayjs(selectedDate).format('MMMM D, YYYY')}`

    return <div className="text-center text-muted-foreground py-8">{message}</div>
  }

  return (
    <div className="space-y-8">
      {renderTimeGroup('Morning', morningSlots)}
      {renderTimeGroup('Afternoon', afternoonSlots)}
    </div>
  )
}

export const CourtAvailabilityList = memo(CourtAvailabilityListComponent)
