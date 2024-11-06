export const AUTH_ERRORS = {
  NO_USER_FOUND: 'No user found with this email',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'An account with this email already exists',
} as const

export function getAuthErrorMessage(error: any): string {
  if (typeof error === 'string') return error
  
  // Supabase error handling
  if (error?.message?.includes('User not found')) {
    return AUTH_ERRORS.NO_USER_FOUND
  }
  
  // NextAuth error handling
  if (error?.type === 'CredentialsSignin') {
    return AUTH_ERRORS.INVALID_CREDENTIALS
  }

  return error?.message || 'An unexpected error occurred'
} 
