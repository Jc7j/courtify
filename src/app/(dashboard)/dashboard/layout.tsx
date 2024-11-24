'use client'

import { AppSidebar, SidebarProvider } from '@/components/ui'
import { ReactNode, Suspense } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { useCompany } from '@/hooks/useCompany'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

function CompanyGuard({ children }: { children: ReactNode }) {
  const { isLoading: userLoading } = useUserStore()
  const { company, loading: companyLoading } = useCompany()

  if (userLoading || companyLoading) {
    return null // Layout will show loading state
  }

  // if (!company) {
  //   redirect(ROUTES.AUTH.SIGNUP)
  // }

  return <>{children}</>
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<DashboardSkeleton />}>
            <CompanyGuard>{children}</CompanyGuard>
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
        <div className="h-4 w-96 bg-muted animate-pulse rounded-md" />
      </div>
      <div className="grid gap-6 mt-8">
        <div className="h-[200px] w-full bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-[160px] bg-muted animate-pulse rounded-lg" />
          <div className="h-[160px] bg-muted animate-pulse rounded-lg" />
          <div className="h-[160px] bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  )
}
