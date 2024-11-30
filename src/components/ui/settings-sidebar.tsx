'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from '@/lib/utils/cn'
import { ROUTES } from '@/constants/routes'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const workspaceSettings = [
  // {
  //   title: 'Overview',
  //   path: ROUTES.DASHBOARD.SETTINGS.HOME,
  // },
  {
    title: 'General',
    path: ROUTES.DASHBOARD.SETTINGS.COMPANY,
  },
  // {
  //   title: 'Security',
  //   path: ROUTES.DASHBOARD.SETTINGS.SECURITY,
  // },
  {
    title: 'Members',
    path: ROUTES.DASHBOARD.SETTINGS.MEMBERS,
  },
  // {
  //   title: 'Billing',
  //   path: ROUTES.DASHBOARD.SETTINGS.BILLING,
  // },
]

const accountSettings = [
  {
    title: 'Profile',
    path: ROUTES.DASHBOARD.SETTINGS.ACCOUNT,
  },
  // {
  //   title: 'Preferences',
  //   path: ROUTES.DASHBOARD.SETTINGS.PREFERENCES,
  // },
  // {
  //   title: 'Security & Access',
  //   path: ROUTES.DASHBOARD.SETTINGS.SECURITY,
  // },
]

export function SettingsSidebar() {
  const pathname = usePathname()

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
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Workspace</h2>
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

              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Account</h2>
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
