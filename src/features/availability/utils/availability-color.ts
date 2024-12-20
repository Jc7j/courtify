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

export function getStatusClassName(status: AvailabilityStatus): string {
  switch (status) {
    case AvailabilityStatus.Available:
      return 'bg-green-500/10 text-green-700 dark:text-green-500'
    case AvailabilityStatus.Booked:
      return 'bg-primary/10 text-primary-700 dark:text-primary-400'
    case AvailabilityStatus.Held:
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500'
    default:
      return 'bg-muted/10 text-muted-foreground'
  }
}
