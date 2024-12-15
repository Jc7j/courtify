'use client'

import * as React from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDatePicker } from '@rehookify/datepicker'
import dayjs from 'dayjs'
import cn from '@/lib/utils/cn'
import type { VariantProps } from 'class-variance-authority'

interface DatePickerProps {
  date?: Date
  onSelect: (date: Date) => void
  label?: string
  className?: string
  buttonClassName?: string
  variant?: VariantProps<typeof buttonVariants>['variant']
  leftIcon?: React.ReactNode
}

export function DatePicker({
  date,
  onSelect,
  label = 'Pick a date',
  className,
  buttonClassName,
  variant,
  leftIcon,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const {
    data: { weekDays, calendars },
    propGetters: { dayButton, addOffset, subtractOffset },
  } = useDatePicker({
    selectedDates: date ? [date] : [],
    onDatesChange: ([newDate]) => {
      if (newDate) {
        onSelect(newDate)
        setIsOpen(false)
      }
    },
    dates: { toggle: true },
  })

  // calendars[0] is always present, this is the initial calendar
  const { year, month, days } = calendars[0]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            'justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            buttonClassName
          )}
        >
          {leftIcon}
          {date ? dayjs(date).format('dddd, MMM D, YYYY') : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto p-0', className)} align="start">
        <div className="grid grid-cols-7 gap-1 p-3">
          {/* Month and Year */}
          <div className="col-span-7 mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              {...subtractOffset({ months: 1 })}
              aria-label="Previous month"
            >
              &lt;
            </Button>
            <div className="font-medium">
              {month} {year}
            </div>
            <Button variant="ghost" size="sm" {...addOffset({ months: 1 })} aria-label="Next month">
              &gt;
            </Button>
          </div>

          {/* Weekday Headers */}
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm text-muted-foreground p-2">
              {day.slice(0, 2)}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((dpDay) => {
            const buttonProps = dayButton(dpDay)
            return (
              <Button
                key={dpDay.$date.toDateString()}
                variant={dpDay.selected ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-9 w-9',
                  !dpDay.inCurrentMonth && 'text-muted-foreground/50',
                  dpDay.selected && 'bg-primary text-primary-foreground'
                )}
                {...buttonProps}
              >
                {dpDay.day}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
