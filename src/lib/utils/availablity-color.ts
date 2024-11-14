export function getAvailabilityColor(status: string): string {
  switch (status) {
    case 'available':
      return '#22c55e'
    case 'booked':
      return '#ef4444'
    case 'past':
      return '#6b7280'
    default:
      return '#cbd5e1'
  }
}
