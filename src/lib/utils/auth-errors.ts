export const AUTH_ERRORS = {
  NO_USER_FOUND: 'No user found with this email',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'An account with this email already exists',
  UNEXPECTED: 'An unexpected error occurred',
  USER_NOT_FOUND: 'User account not found. Please contact support.',
  ACCOUNT_DISABLED: 'This account has been disabled. Please contact support.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  REFRESH_FAILED: 'Unable to refresh session. Please sign in again.',
  INVALID_SESSION: 'Invalid session. Please sign in again.',
  ACCOUNT_INACTIVE: 'This account has been disabled. Please contact support.',
} as const

interface ErrorWithMessage {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for our custom error messages first
    if (
      Object.values(AUTH_ERRORS).includes(
        error.message as (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS]
      )
    ) {
      return error.message
    }

    if (isErrorWithMessage(error)) {
      if (error.message.includes('User not found')) {
        return AUTH_ERRORS.NO_USER_FOUND
      }
      if (error.message.includes('Invalid login credentials')) {
        return AUTH_ERRORS.INVALID_CREDENTIALS
      }
      return error.message
    }
  }
  return AUTH_ERRORS.UNEXPECTED
}
