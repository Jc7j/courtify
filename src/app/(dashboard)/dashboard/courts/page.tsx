'use client'

import { Plus } from 'lucide-react'
import { useCallback } from 'react'

import { CourtList } from '@/features/courts/components/CourtList'
import { CourtsErrorBoundary } from '@/features/courts/components/CourtsErrorBoundary'
import { useCourt } from '@/features/courts/hooks/useCourt'

import { Button } from '@/shared/components/ui'

export default function CourtsPage() {
  const {
    courts,
    loading: courtsLoading,
    creating,
    updateCourtStatus,
    updateCourt,
    createCourt,
  } = useCourt()

  const handleCreateCourt = useCallback(
    async (name: string) => {
      await createCourt(name)
    },
    [createCourt]
  )

  const handleStatusChange = useCallback(
    async (courtNumber: number, isActive: boolean) => {
      await updateCourtStatus(courtNumber, isActive)
    },
    [updateCourtStatus]
  )

  const handleUpdateCourt = useCallback(
    async (courtNumber: number, name: string) => {
      await updateCourt(courtNumber, name)
    },
    [updateCourt]
  )

  return (
    <CourtsErrorBoundary>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courts</h1>
            <p className="text-muted-foreground mt-2">
              Manage your courts and schedules all in one place.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleCreateCourt('New Court')}
              disabled={creating}
              className="gap-2"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Court
            </Button>
          </div>
        </div>

        <CourtList
          courts={courts}
          loading={courtsLoading}
          creating={creating}
          onCreateCourt={handleCreateCourt}
          onStatusChange={handleStatusChange}
          onUpdateCourt={handleUpdateCourt}
        />
      </div>
    </CourtsErrorBoundary>
  )
}
