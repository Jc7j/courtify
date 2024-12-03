'use client'

import { AppSidebar, SidebarProvider } from '@/components/ui'
import { useCompany } from '@/hooks/useCompany'
import { ReactNode, Suspense } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { company } = useCompany()
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar companyName={company?.name || 'Courtify'} />

        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
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
