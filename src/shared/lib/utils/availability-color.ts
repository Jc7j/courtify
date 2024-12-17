import { AvailabilityStatus } from '@/shared/types/graphql'

export function getAvailabilityColor(status: AvailabilityStatus): string {
  const colors = {
    [AvailabilityStatus.Available]: '#22c55e', // Green
    [AvailabilityStatus.Booked]: 'hsl(var(--primary) / 0.8)', // Muted dark color
    [AvailabilityStatus.Held]: '#f59e0b', // Keep yellow for held status
  }

  return colors[status] || 'hsl(var(--muted))'
}
