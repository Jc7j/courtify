'use client'

import { ProfileSection } from '@/features/settings/components/UserSettings/ProfileSection'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import { Skeleton } from '@/shared/components/ui'

export default function AccountPage() {
  const { user, isLoading } = useUserStore()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account profile and preferences</p>
      </div>

      <div className="grid gap-8 mt-8">
        <ProfileSection user={user} />
      </div>
    </div>
  )
}
