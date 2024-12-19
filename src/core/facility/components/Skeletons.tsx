import { Card, CardContent, Skeleton } from '@/shared/components/ui'

export function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-64" /> {/* Welcome text */}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-4 w-32" /> {/* Guest booking link label */}
          <Skeleton className="h-9 w-[280px]" /> {/* Booking URL button */}
        </div>
      </div>

      {/* Calendar Skeleton */}
      <Card>
        <CardContent className="p-6">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-[200px]" /> {/* Edit mode switch */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" /> {/* Previous button */}
                <Skeleton className="h-8 w-[280px]" /> {/* Date picker */}
                <Skeleton className="h-8 w-8" /> {/* Next button */}
              </div>
            </div>
            <Skeleton className="h-8 w-[200px]" /> {/* Options menu */}
          </div>

          {/* Calendar Grid */}
          <div className="mt-4">
            <div className="grid grid-cols-[100px_1fr] gap-4">
              {/* Time column */}
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
              {/* Courts grid */}
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
