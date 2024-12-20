'use client'

import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'
import { memo, RefObject } from 'react'

import { Button, Switch, DatePicker } from '@/shared/components/ui'

import { CalendarOptionsMenu } from './CalendarOptionsMenu'
import { useCalendarStore } from '../../hooks/useCalendarStore'

import type FullCalendar from '@fullcalendar/react'

interface CalendarHeaderProps {
  onDateChange: (start: string, end: string) => void
  calendarRef: RefObject<FullCalendar>
}

function CalendarHeaderComponent({ onDateChange, calendarRef }: CalendarHeaderProps) {
  const { selectedDate, setSettings, settings } = useCalendarStore()

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="w-[200px] flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${settings.editMode ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {settings.editMode ? 'Edit Mode' : 'Read Only'}
          </span>
          <Switch
            checked={settings.editMode}
            onCheckedChange={() => setSettings({ editMode: !settings.editMode })}
            className={settings.editMode ? 'data-[state=checked]:bg-primary' : ''}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 bg-background/50  p-1`}>
          <Button
            variant={settings.editMode ? 'outline-primary' : 'outline'}
            size="icon"
            onClick={() => {
              const newDate = selectedDate.subtract(1, 'day')
              onDateChange(newDate.startOf('day').toISOString(), newDate.endOf('day').toISOString())
              calendarRef.current?.getApi().prev()
            }}
          >
            <ChevronLeft
              className={`h-5 w-5 ${settings.editMode ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </Button>

          <DatePicker
            date={selectedDate.toDate()}
            onSelect={(date) => {
              const newDate = dayjs(date)
              onDateChange(newDate.startOf('day').toISOString(), newDate.endOf('day').toISOString())
              calendarRef.current?.getApi().gotoDate(date)
            }}
            buttonClassName={`w-[280px] text-lg font-medium items-center justify-center ${
              settings.editMode
                ? 'text-primary hover:bg-primary/10'
                : 'text-muted-foreground hover:bg-muted'
            }`}
            variant="ghost"
            leftIcon={
              <CalendarIcon
                className={`h-4 w-4 ${settings.editMode ? 'text-primary' : 'text-muted-foreground'}`}
              />
            }
          />

          <Button
            variant={settings.editMode ? 'outline-primary' : 'outline'}
            size="icon"
            onClick={() => {
              const newDate = selectedDate.add(1, 'day')
              onDateChange(newDate.startOf('day').toISOString(), newDate.endOf('day').toISOString())
              calendarRef.current?.getApi().next()
            }}
          >
            <ChevronRight
              className={`h-5 w-5 ${settings.editMode ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </Button>
        </div>
      </div>

      <div className="w-[200px] flex justify-end">
        <CalendarOptionsMenu />
      </div>
    </div>
  )
}

export const CalendarHeader = memo(CalendarHeaderComponent)
