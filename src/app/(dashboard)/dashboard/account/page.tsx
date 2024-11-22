'use client'

import { useUser } from '@/providers/UserProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui'
import { ProfileSection } from '@/components/account/ProfileSection'
import { SecuritySection } from '@/components/account/SecuritySection'

export default function AccountPage() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full max-w-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
