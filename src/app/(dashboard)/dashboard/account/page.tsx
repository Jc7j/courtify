'use client'

import { useUser } from '@/providers/UserProvider'
import { ProfileSection } from '@/components/account/ProfileSection'
import { SecuritySection } from '@/components/account/SecuritySection'

export default function AccountPage() {
  const { user } = useUser()

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <ProfileSection user={user} />
      <SecuritySection />
    </div>
  )
}
