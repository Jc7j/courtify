export class FacilityClientService {
  static validateFacilityName(name: string): { isValid: boolean; error?: string } {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return { isValid: false, error: 'Facility name is required' }
    }

    if (trimmedName.length < 2) {
      return { isValid: false, error: 'Facility name must be at least 2 characters' }
    }

    return { isValid: true }
  }

  static formatFacilityName(name: string): string {
    return name.trim().replace(/\s+/g, ' ')
  }

  static generateFacilitySlug(name: string): string {
    const formattedName = this.formatFacilityName(name)
    const timestamp = Date.now().toString(36).slice(-5)

    return (
      formattedName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      timestamp
    )
  }

  static validateFacilityInput(
    name: string,
    address: string
  ): { isValid: boolean; error?: string } {
    const nameValidation = this.validateFacilityName(name)
    if (!nameValidation.isValid) {
      return nameValidation
    }

    if (!address.trim()) {
      return { isValid: false, error: 'Address is required' }
    }

    return { isValid: true }
  }
}
