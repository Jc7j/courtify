'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { CourtList } from '@/features/courts/components/CourtList'
import { CourtsErrorBoundary } from '@/features/courts/components/CourtsErrorBoundary'
import { useCourt } from '@/features/courts/hooks/useCourt'

import { Button, Card, ErrorToast, SuccessToast } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants/routes'

export default function CourtsPage() {
  const router = useRouter()
  const { courts, loading: courtsLoading, createCourt, creating } = useCourt()

  const handleCreateCourt = useCallback(
    async (name: string) => {
      try {
        await createCourt(name)
        SuccessToast('Court created successfully')
      } catch (err) {
        ErrorToast(err instanceof Error ? err.message : 'Failed to create court')
      }
    },
    [createCourt]
  )

  const handleCourtClick = useCallback(
    (courtNumber: number) => {
      router.push(`${ROUTES.DASHBOARD.HOME}/courts/${courtNumber}`)
    },
    [router]
  )

  return (
    <CourtsErrorBoundary>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Court Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your courts and schedules all in one place.
          </p>
        </div>

        <div className="grid gap-8">
          <Card className="p-6 space-y-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Court Management</h2>
                <p className="text-sm text-muted-foreground">
                  Add and manage courts, set schedules, and track bookings
                </p>
              </div>
              <Button
                variant="outline"
                className="text-primary hover:text-primary-foreground hover:bg-primary"
                onClick={() => handleCreateCourt('New Court')}
                disabled={creating}
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Court
              </Button>
            </div>
            <CourtList
              courts={courts}
              loading={courtsLoading}
              creating={creating}
              onCreateCourt={handleCreateCourt}
              onCourtClick={handleCourtClick}
            />
          </Card>
        </div>
      </div>
    </CourtsErrorBoundary>
  )
}
