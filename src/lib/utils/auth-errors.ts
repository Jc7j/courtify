export const AUTH_ERRORS = {
  NO_USER_FOUND: 'No user found with this email',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'An account with this email already exists',
} as const

interface ErrorWithMessage {
  message: string
}

interface NextAuthError {
  type?: string
  message?: string
}

// Type guard to check if error has message property
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

// Type guard for NextAuth error
function isNextAuthError(error: unknown): error is NextAuthError {
  return typeof error === 'object' && error !== null && 'type' in error
}

export function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error

  if (isErrorWithMessage(error)) {
    // Supabase error handling
    if (error.message.includes('User not found')) {
      return AUTH_ERRORS.NO_USER_FOUND
    }
    return error.message
  }

  if (isNextAuthError(error)) {
    // NextAuth error handling
    if (error.type === 'CredentialsSignin') {
      return AUTH_ERRORS.INVALID_CREDENTIALS
    }
    if (error.message) {
      return error.message
    }
  }

  return 'An unexpected error occurred'
}
