'use client'

import { Suspense } from 'react'

import { MembersSection } from '@/features/settings/components/CompanySettings/MembersSection'
import { MembersSkeleton } from '@/features/settings/components/Skeletons'

import { useCompanyMembers } from '@/core/user/hooks/useUser'
import { useUserStore } from '@/core/user/hooks/useUserStore'

function MembersContent() {
  const { user } = useUserStore()
  const { members } = useCompanyMembers(user?.company_id ?? '')

  return <MembersSection members={members} />
}

export default function MembersPage() {
  const { user } = useUserStore()

  if (!user?.company_id) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No company found</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground">Manage your company members and roles</p>
      </div>

      <div className="grid gap-8 mt-8">
        <Suspense fallback={<MembersSkeleton />}>
          <MembersContent />
        </Suspense>
      </div>
    </div>
  )
}
