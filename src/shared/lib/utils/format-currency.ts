interface FormatCurrencyOptions {
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Formats a number as currency with the specified currency code and locale
 * @param amount - The amount to format (in the smallest currency unit, e.g., cents)
 * @param currency - The ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @param options - Additional formatting options
 * @returns Formatted currency string (e.g., "$10.00", "€10.00")
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options: FormatCurrencyOptions = {}
): string {
  const { locale = 'en', minimumFractionDigits = 2, maximumFractionDigits = 2 } = options

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount)
  } catch (error) {
    console.error(`Error formatting currency: ${currency}`, error)
    return `${currency.toUpperCase()} ${amount.toFixed(minimumFractionDigits)}`
  }
}

// Usage examples:
// formatCurrency(1000, 'USD') => "$10.00"
// formatCurrency(1000, 'EUR', { locale: 'de-DE' }) => "10,00 €"
// formatCurrency(1000, 'JPY', { minimumFractionDigits: 0 }) => "¥1,000"
// formatCurrency(1000.56789, 'USD', { maximumFractionDigits: 3 }) => "$10.568"
