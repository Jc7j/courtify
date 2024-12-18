'use client'

import { ChevronsUpDown, LogOut, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useUserStore } from '@/core/user/hooks/useUserStore'

import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui/sidebar'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/utils/cn'
import { useAuth } from '@/shared/providers/AuthProvider'

export function UserMenu() {
  const { user } = useUserStore()
  const { signOut } = useAuth()
  const { isMobile } = useSidebar()
  const router = useRouter()

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                'w-full',
                'data-[state=open]:bg-sidebar-accent',
                'data-[state=open]:text-sidebar-accent-foreground',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                'transition-colors duration-200',
                isMobile && 'w-auto p-0'
              )}
            >
              <Avatar className="h-8 w-8 rounded-md border border-border">
                <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isMobile && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              'w-[--radix-dropdown-menu-trigger-width]',
              'min-w-[256px]',
              'rounded-md',
              'p-2',
              'border-border',
              isMobile && 'right-0 left-auto'
            )}
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 px-1 py-1">
                <Avatar className="h-8 w-8 rounded-md border border-border">
                  <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-medium text-foreground">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-3"
                onClick={() => router.push(ROUTES.DASHBOARD.SETTINGS.COMPANY)}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="gap-3 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
