'use client'

import { Bell } from 'lucide-react'
import { Button } from './button'
import { Logo } from './logo'
import { useUser } from '@/hooks/useUser'
import { memo } from 'react'
import { Skeleton } from './skeleton'

function AppHeaderComponent() {
  const { user, loading } = useUser()

  return (
    <header className="border-b border-border bg-background w-full">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Logo */}
        <div className="flex items-center gap-6">
          <Logo size="sm" />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Info */}
          <div className="flex items-center gap-2">
            {loading ? (
              <>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </>
            ) : (
              <>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-medium text-secondary-foreground">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export const AppHeader = memo(AppHeaderComponent)
