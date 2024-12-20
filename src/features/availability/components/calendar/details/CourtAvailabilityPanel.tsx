'use client'

import { X } from 'lucide-react'
import { memo } from 'react'

import { useCalendarStore } from '@/features/availability/hooks/useCalendarStore'

import { Button } from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils/cn'

export const CourtAvailabilityPanel = memo(function CourtAvailabilityPanel() {
  const { selectedAvailability, isPanelOpen, setSelectedAvailability } = useCalendarStore()

  if (!selectedAvailability || !isPanelOpen) return null
  console.log('selectedAvailability', selectedAvailability)
  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 w-[400px] bg-background/95 backdrop-blur-sm border-l shadow-lg',
        'transform transition-transform duration-1000 ease-in-out z-50',
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Court Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedAvailability(null)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Court</label>
              <p className="text-foreground">Court {selectedAvailability.court_number}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="text-foreground capitalize">{selectedAvailability.status}</p>
            </div>

            {selectedAvailability.booking && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="text-foreground">{selectedAvailability.booking.customer_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Payment Status
                  </label>
                  <p className="text-foreground capitalize">
                    {selectedAvailability.booking.payment_status}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
