import { AvailabilityStatus } from '@/shared/types/graphql'

export function getAvailabilityColor(status: AvailabilityStatus): string {
  switch (status) {
    case AvailabilityStatus.Available:
      return '#22c55e' // Green
    case AvailabilityStatus.Booked:
      return 'hsl(var(--primary) / 0.8)'
    case AvailabilityStatus.Held:
      return '#f59e0b' // Yellow for held status
    default:
      return 'hsl(var(--muted))'
  }
}
