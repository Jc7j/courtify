export class CompanyClientService {
  static validateCompanyName(name: string): { isValid: boolean; error?: string } {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return { isValid: false, error: 'Company name is required' }
    }

    if (trimmedName.length < 2) {
      return { isValid: false, error: 'Company name must be at least 2 characters' }
    }

    return { isValid: true }
  }

  static formatCompanyName(name: string): string {
    return name.trim().replace(/\s+/g, ' ')
  }

  static generateCompanySlug(name: string): string {
    const formattedName = this.formatCompanyName(name)
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

  static validateCompanyInput(name: string, address: string): { isValid: boolean; error?: string } {
    const nameValidation = this.validateCompanyName(name)
    if (!nameValidation.isValid) {
      return nameValidation
    }

    if (!address.trim()) {
      return { isValid: false, error: 'Address is required' }
    }

    return { isValid: true }
  }
}
