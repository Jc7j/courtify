import { MemberRole } from '@/shared/types/graphql'

import type { BaseUser } from '@/shared/types/auth'

type AdminAccessOptions = {
  requireOwner?: boolean
  requireAdmin?: boolean
}

/**
 * Checks if a user has admin-level access based on specified role requirements
 * @param user The user to check access for
 * @param options Optional configuration to require specific admin roles
 * @returns boolean indicating if user has required access level
 */
export function hasAdminAccess(
  user: BaseUser | null,
  options: AdminAccessOptions = { requireOwner: false, requireAdmin: false }
): boolean {
  if (!user) return false

  const { requireOwner, requireAdmin } = options

  // If no specific requirements, check for either role
  if (!requireOwner && !requireAdmin) {
    return user.role === MemberRole.Owner || user.role === MemberRole.Admin
  }

  // Check against specific role requirements
  if (requireOwner && requireAdmin) {
    return user.role === MemberRole.Owner || user.role === MemberRole.Admin
  }

  if (requireOwner) {
    return user.role === MemberRole.Owner
  }

  if (requireAdmin) {
    return user.role === MemberRole.Admin
  }

  return false
}
