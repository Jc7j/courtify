export class CourtClientService {
  static validateCourtName(name: string): { isValid: boolean; error?: string } {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return { isValid: false, error: 'Court name is required' }
    }

    if (trimmedName.length < 3) {
      return { isValid: false, error: 'Court name must be at least 3 characters' }
    }

    return { isValid: true }
  }

  static formatCourtName(name: string): string {
    return name.trim().replace(/\s+/g, ' ')
  }
}
