'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, Suspense, useEffect } from 'react'

import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

import { AppSidebar } from '@/shared/components/ui/app-sidebar'
import { SidebarProvider } from '@/shared/components/ui/sidebar'

function getPageTitle(pathname: string): string {
  const routes = {
    '/dashboard': 'Dashboard',
    '/dashboard/courts': 'Courts',
    '/dashboard/settings/company': 'Company Settings',
    '/dashboard/settings/members': 'Members',
    '/dashboard/settings/account': 'Account Settings',
    '/dashboard/settings/payment-processor': 'Payment Processor',
  }

  return routes[pathname as keyof typeof routes] || 'Dashboard'
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const companyName = useCompanyStore((state) => state.company?.name)
  const pageTitle = getPageTitle(pathname)

  // Update title when company or page changes
  useEffect(() => {
    document.title = companyName ? `${companyName} | ${pageTitle}` : `${pageTitle} | Courtify`
  }, [companyName, pageTitle])

  return (
    <SidebarProvider>
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto lg:h-screen">
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
