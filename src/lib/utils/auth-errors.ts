export const AUTH_ERRORS = {
  NO_USER_FOUND: 'No user found with this email',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'An account with this email already exists',
  UNEXPECTED: 'An unexpected error occurred',
} as const

interface ErrorWithMessage {
  message: string
}

// Type guard for error with message
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

export function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error

  if (isErrorWithMessage(error)) {
    if (error.message.includes('User not found')) {
      return AUTH_ERRORS.NO_USER_FOUND
    }
    if (error.message.includes('Invalid login credentials')) {
      return AUTH_ERRORS.INVALID_CREDENTIALS
    }
    return error.message
  }

  return AUTH_ERRORS.UNEXPECTED
}
