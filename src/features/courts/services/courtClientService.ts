export class CourtClientService {
  static validateCourtName(name: string): { isValid: boolean; error?: string } {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return { isValid: false, error: 'Court name is required' }
    }

    return { isValid: true }
  }

  static formatCourtName(name: string): string {
    return name.trim().replace(/\s+/g, ' ')
  }
}
