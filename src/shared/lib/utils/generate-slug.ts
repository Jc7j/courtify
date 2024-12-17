export function generateSlug(str: string): string {
  // Generate timestamp suffix (e.g. 'x1a2b')
  const timestamp = Date.now().toString(36).slice(-5)

  return (
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    timestamp
  )
}
