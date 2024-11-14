import { AvailabilityStatus } from '@/types/graphql'

export function getAvailabilityColor(status: AvailabilityStatus): string {
  const colors = {
    [AvailabilityStatus.Available]: '#22c55e', // Green from design system
    [AvailabilityStatus.Booked]: '#ef4444', // Red from design system
    [AvailabilityStatus.Past]: '#6b7280', // Gray from design system
  }

  return colors[status] || '#6b7280'
}
