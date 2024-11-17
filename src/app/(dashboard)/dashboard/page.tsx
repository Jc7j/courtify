'use client'

import { useUser } from '@/providers/UserProvider'
import { Skeleton } from '@/components/ui'

export default function DashboardPage() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[600px] w-full mt-8" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-foreground">Welcome back, {user?.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {user?.company_id
          ? 'Welcome to your Courtify dashboard'
          : 'Please complete your company setup to get started'}
      </p>
    </div>
  )
}
