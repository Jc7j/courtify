'use client'

import { ChevronsUpDown, LogOut, Settings } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useUser } from '@/providers/UserProvider'
import { signOut } from 'next-auth/react'
import { ROUTES } from '@/constants/routes'
import cn from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const { user } = useUser()
  const { isMobile } = useSidebar()
  const router = useRouter()

  if (!user) return null

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleSignOut = () => {
    signOut({ callbackUrl: ROUTES.AUTH.SIGNIN })
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
                'transition-colors duration-200'
              )}
            >
              <Avatar className="h-8 w-8 rounded-md border border-border">
                <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              'w-[--radix-dropdown-menu-trigger-width]',
              'min-w-[256px]',
              'rounded-md',
              'p-2',
              'border-border'
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
                  <span className="font-medium text-foreground">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="gap-3"
                onClick={() => router.push(ROUTES.DASHBOARD.ACCOUNT)}
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
