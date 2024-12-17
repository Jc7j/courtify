'use client'

import { MembersSection } from '@/core/company/components/CompanySettings/MembersSection'
import { useCompanyMembers } from '@/core/user/hooks/useUser'

import { useUserStore } from '@/shared/stores/useUserStore'

export default function MembersPage() {
  const { user } = useUserStore()
  const { members, loading } = useCompanyMembers(user?.company_id ?? '')

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
        <MembersSection members={members} loading={loading} />
      </div>
    </div>
  )
}
