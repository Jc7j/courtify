'use client'

import { Suspense } from 'react'

import { FacilityProfileSection } from '@/features/settings/components/FacilitySettings/FacilityProfileSection'
import { FacilityProfileSkeleton } from '@/features/settings/components/Skeletons'

import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'

import { Facility } from '@/shared/types/graphql'

// @TODO Have courtcalendar be horizontal scrolling if it gets past that far, but have
// a button to press full view then a modal will pop up with the full view. &&
// Add all toasts to every action aka (hook, maybe featureServerSevice) for a single source of truth.
// We also dont need try catch in every function, we can just have a single error handler.

export default function SettingsPage() {
  const facility = useFacilityStore((state) => state.facility)

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Facility Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your facility profile and preferences
        </p>
      </div>

      <div className="grid gap-8 mt-8">
        <Suspense fallback={<FacilityProfileSkeleton />}>
          <FacilityProfileSection facility={facility as Facility} />
        </Suspense>
      </div>
    </div>
  )
}
