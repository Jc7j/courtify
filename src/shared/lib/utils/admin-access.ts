import { BaseUser } from '@/shared/types/auth'

/**
 * Checks if a user has admin-level access (owner or admin role)
 */
export function hasAdminAccess(user: BaseUser | null): boolean {
  return user?.role === 'owner' || user?.role === 'admin'
}
