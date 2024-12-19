import { Expand, Shrink, MoreHorizontal } from 'lucide-react'

import { useCalendarStore } from '@/features/availability/hooks/useCalendarStore'

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Switch,
} from '@/shared/components/ui'

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return {
    value: `${hour}:00:00`,
    label: `${i === 0 ? '12' : i > 12 ? i - 12 : i}:00 ${i >= 12 ? 'PM' : 'AM'}`,
  }
})

export function CalendarOptionsMenu() {
  const { settings, setSettings } = useCalendarStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline-primary" size="sm" className="gap-2">
          <MoreHorizontal className="h-4 w-4 text-primary" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Calendar Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="p-2">
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Time Range</span>
              </div>
              <div className="flex flex-col  gap-2">
                <Select
                  value={settings.slotMinTime}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      slotMinTime: value,
                      slotMaxTime:
                        value >= settings.slotMaxTime
                          ? TIME_OPTIONS[TIME_OPTIONS.findIndex((t) => t.value === value) + 1]
                              ?.value || '24:00:00'
                          : settings.slotMaxTime,
                    })
                  }
                >
                  <SelectTrigger className="w-[110px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem
                        key={time.value}
                        value={time.value}
                        disabled={time.value >= settings.slotMaxTime}
                      >
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={settings.slotMaxTime}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      slotMaxTime: value,
                    })
                  }
                >
                  <SelectTrigger className="w-[110px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem
                        key={time.value}
                        value={time.value}
                        disabled={time.value <= settings.slotMinTime}
                      >
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="px-2 py-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.isFullHeight ? (
                  <Expand className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Shrink className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {settings.isFullHeight ? 'Full View' : 'Compact View'}
                </span>
              </div>
              <Switch
                checked={settings.isFullHeight}
                onCheckedChange={(checked) => setSettings({ ...settings, isFullHeight: checked })}
              />
            </div>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
