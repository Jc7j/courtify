'use client'

import { Calendar, Home, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

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
  SidebarTrigger,
} from '@/shared/components/ui/sidebar'
import { UserMenu } from '@/shared/components/ui/user-menu'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/utils/cn'

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
    title: 'Products',
    url: ROUTES.DASHBOARD.PRODUCTS,
    icon: ShoppingBag,
    exact: false,
  },
]

export function AppSidebar() {
  const { company } = useCompanyStore()
  const pathname = usePathname()

  const isActivePath = (path: string, exact: boolean) => {
    if (exact) {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-16 border-b border-border bg-background">
        <SidebarTrigger />
        <UserMenu />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:block w-[250px]">
        <SidebarContent>
          <SidebarGroup>
            <SidebarHeader className="border-b border-sidebar-border">
              <div className="flex items-center gap-3 p-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sidebar-foreground">
                    {company?.name || 'Courtify'}
                  </span>
                </div>
              </div>
            </SidebarHeader>
            <SidebarGroupContent className="p-4">
              <SidebarMenu>
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
          <UserMenu />
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
