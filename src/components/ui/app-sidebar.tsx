'use client'

import { Calendar, Home, ListChecks, Settings, Plus } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import cn from '@/lib/utils/cn'
import { useState } from 'react'
import { CourtAvailabilityDialog } from '@/components/courts/CourtAvailabilityDialog'
import dayjs from 'dayjs'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from './button'
import { UserMenu } from '@/components/ui/user-menu'
import { ROUTES } from '@/constants/routes'
import { AvailabilityStatus } from '@/types/graphql'

const items = [
  {
    title: 'Home',
    url: ROUTES.DASHBOARD.HOME,
    icon: Home,
    exact: true,
  },
  {
    title: 'Courts',
    url: ROUTES.DASHBOARD.COURTS,
    icon: Calendar,
    exact: false,
  },
  {
    title: 'Settings',
    url: ROUTES.DASHBOARD.SETTINGS,
    icon: Settings,
    exact: true,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [showNewAvailabilityDialog, setShowNewAvailabilityDialog] = useState(false)

  const isActivePath = (path: string, exact: boolean) => {
    if (exact) {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <Sidebar className="hidden lg:block w-[280px]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-3 p-4">
              <Logo size="sm" href="/dashboard" clickable />
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-lg text-sidebar-foreground">Courtify</span>
                <span className="text-xs text-sidebar-foreground/60">
                  v{process.env.NEXT_PUBLIC_APP_VERSION}
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarGroupContent className="p-4">
            <SidebarMenu>
              <Button
                variant="outline"
                onClick={() => setShowNewAvailabilityDialog(true)}
                className={cn(
                  'w-full mb-6',
                  'bg-sidebar-accent text-sidebar-accent-foreground',
                  'hover:bg-sidebar-accent/90',
                  'border-sidebar-border',
                  'shadow-sm',
                  'h-10',
                  'justify-start gap-3'
                )}
              >
                <Plus className="h-4 w-4" />
                New Court Time
              </Button>
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = isActivePath(item.url, item.exact)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link
                          href={item.url}
                          className={cn(
                            'flex h-10 w-full items-center gap-3 rounded-md px-3',
                            'text-sidebar-foreground/70 hover:text-sidebar-foreground',
                            'transition-colors duration-200',
                            isActive && 'bg-sidebar-accent text-sidebar-foreground font-medium'
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {/* <div > */}
        <UserMenu />
        {/* </div> */}
        {/* <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link className="text-muted-foreground hover:text-foreground" href="#">
              Terms
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link className="text-muted-foreground hover:text-foreground" href="#">
              Privacy
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link className="text-muted-foreground hover:text-foreground" href="#">
              Help
            </Link>
          </div>
        </div> */}
      </SidebarFooter>
      <CourtAvailabilityDialog
        isOpen={showNewAvailabilityDialog}
        onClose={() => setShowNewAvailabilityDialog(false)}
        availability={{
          nodeId: '',
          company_id: '',
          court_number: 1, // Default to first court
          start_time: dayjs().startOf('hour').add(1, 'hour').toISOString(),
          end_time: dayjs().startOf('hour').add(2, 'hour').toISOString(),
          status: AvailabilityStatus.Available,
          created_at: '',
          updated_at: '',
        }}
        isNew={true}
      />
    </Sidebar>
  )
}
