'use client'

import { Suspense } from 'react'

import { AccountSkeleton } from '@/features/settings/components/Skeletons'
import { AccountSection } from '@/features/settings/components/UserSettings/AccountSection'

import { useUserStore } from '@/core/user/hooks/useUserStore'

function AccountContent() {
  const { user } = useUserStore()

  if (!user) return null

  return <AccountSection user={user} />
}

export default function AccountPage() {
  const { user } = useUserStore()

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No user found</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account profile and preferences</p>
      </div>

      <div className="grid gap-8 mt-8">
        <Suspense fallback={<AccountSkeleton />}>
          <AccountContent />
        </Suspense>
      </div>
    </div>
  )
}
