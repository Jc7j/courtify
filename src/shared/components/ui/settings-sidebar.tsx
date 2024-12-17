'use client'

import { ChevronLeft, Building2, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar'
import { ROUTES } from '@/shared/constants/routes'
import { useUserStore } from '@/shared/stores/useUserStore'

import { hasAdminAccess } from '@/shared/lib/utils/admin-access'
import { cn } from '@/shared/lib/utils/cn'

const workspaceSettings = [
  {
    title: 'General',
    path: ROUTES.DASHBOARD.SETTINGS.COMPANY,
  },
  {
    title: 'Members',
    path: ROUTES.DASHBOARD.SETTINGS.MEMBERS,
  },
  {
    title: 'Payment Processor',
    path: ROUTES.DASHBOARD.SETTINGS.PAYMENT_PROCESSOR,
  },
]

const accountSettings = [
  {
    title: 'Profile',
    path: ROUTES.DASHBOARD.SETTINGS.ACCOUNT,
  },
]

export function SettingsSidebar() {
  const pathname = usePathname()
  const { user } = useUserStore()

  return (
    <Sidebar className="hidden lg:block w-[280px] border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarHeader className="border-b border-border p-4">
            <Link
              href={ROUTES.DASHBOARD.HOME}
              className={cn(
                'flex items-center gap-2 text-sm font-medium',
                'text-muted-foreground hover:text-foreground',
                'transition-colors duration-200'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </SidebarHeader>

          <SidebarGroupContent className="p-2">
            <SidebarMenu>
              {/* Only show workspace settings for admin/owner */}
              {hasAdminAccess(user) && (
                <div className="px-3 py-2">
                  <h2 className="mb-2 text-md font-semibold tracking-tight flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    Workspace
                  </h2>
                  <div className="space-y-1">
                    {workspaceSettings.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.path}>
                          <Link
                            href={item.path}
                            className={cn(
                              'flex w-full items-center rounded-md px-4 py-2 text-sm font-medium',
                              'text-muted-foreground hover:text-foreground',
                              'transition-colors duration-200',
                              pathname === item.path && 'bg-accent text-foreground'
                            )}
                          >
                            {item.title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </div>
                </div>
              )}

              {/* Always show account settings */}
              <div className="px-3 py-2">
                <h2 className="mb-2 text-md font-semibold tracking-tight flex items-center gap-2">
                  <UserCircle className="h-3 w-3" />
                  Account
                </h2>
                <div className="space-y-1">
                  {accountSettings.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.path}>
                        <Link
                          href={item.path}
                          className={cn(
                            'flex w-full items-center rounded-md px-4 py-2 text-sm font-medium',
                            'text-muted-foreground hover:text-foreground',
                            'transition-colors duration-200',
                            pathname === item.path && 'bg-accent text-foreground'
                          )}
                        >
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
