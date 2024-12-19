import { memo } from 'react'

interface BookingSidebarProps {
  facilityName: string
}

// Desktop only for now
function BookingSidebarComponent({ facilityName }: BookingSidebarProps) {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-secondary items-center justify-center p-12 sticky top-0 h-screen">
      <div className="max-w-lg space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-secondary-foreground text-center">
            Book Your Court at {facilityName}
          </h2>
          <p className="text-secondary-foreground/80 text-center text-base leading-relaxed">
            Select your preferred court and time slot.
          </p>
        </div>
      </div>
    </div>
  )
}

export const BookingSidebar = memo(BookingSidebarComponent)
