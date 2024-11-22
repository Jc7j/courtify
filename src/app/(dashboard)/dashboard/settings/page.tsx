'use client'

import { useCompany } from '@/hooks/useCompany'
import { CompanyProfileCard } from '@/components/settings/CompanyProfileCard'

export default function SettingsPage() {
  const { company, loading: companyLoading, error } = useCompany()

  if (error) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">Error loading company data: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Company Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your company profile and preferences</p>
      </div>

      <CompanyProfileCard company={company} loading={companyLoading} />
    </div>
  )
}
