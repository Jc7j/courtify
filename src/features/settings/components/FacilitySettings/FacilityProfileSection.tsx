'use client'

import { useCallback } from 'react'

import { useFacility } from '@/core/facility/hooks/useFacility'

import { Card, InlineEdit, SuccessToast, ErrorToast } from '@/shared/components/ui'
import { Facility } from '@/shared/types/graphql'

import { FacilityProfileSkeleton } from '../Skeletons'

interface FacilityProfileSectionProps {
  facility: Facility
}

export function FacilityProfileSection({ facility }: FacilityProfileSectionProps) {
  const { updateFacility, updating } = useFacility()

  const handleSaveName = useCallback(
    async (newName: string) => {
      if (!facility) return

      try {
        await updateFacility({
          name: newName.trim(),
          slug: facility.slug,
        })
        SuccessToast('Facility name updated')
      } catch (err) {
        ErrorToast(err instanceof Error ? err.message : 'Failed to update facility name')
        throw err
      }
    },
    [facility, updateFacility]
  )

  const handleSaveSlug = useCallback(
    async (newSlug: string) => {
      if (!facility) return

      try {
        await updateFacility({
          name: facility.name,
          slug: newSlug.trim(),
        })
        SuccessToast('Facility URL updated')
      } catch (err) {
        ErrorToast(err instanceof Error ? err.message : 'Failed to update facility URL')
        throw err
      }
    },
    [facility, updateFacility]
  )

  if (!facility) {
    return <FacilityProfileSkeleton />
  }

  return (
    <Card>
      <div className="p-4 flex items-center justify-between gap-4">
        <label className="text-sm font-medium">Name</label>
        <InlineEdit
          value={facility.name}
          onSave={handleSaveName}
          saving={updating}
          className="w-[200px] text-right bg-muted"
          validate={(value) => {
            if (!value.trim()) return 'Facility name cannot be empty'
            if (value.length > 50) return 'Facility name is too long'
            return true
          }}
        />
      </div>

      <div className="p-4 flex items-center justify-between gap-4 border-t">
        <label className="text-sm font-medium">URL</label>
        <div className="flex items-center gap-0">
          <div className="flex items-center rounded-l-md border-0 bg-muted/50 px-3 text-sm text-muted-foreground">
            courtify.app/
          </div>
          <InlineEdit
            value={facility.slug}
            onSave={handleSaveSlug}
            saving={updating}
            className="w-[200px] text-right bg-muted rounded-l-none"
            validate={(value) => {
              if (!value.trim()) return 'URL cannot be empty'
              if (!/^[a-z0-9-]+$/.test(value))
                return 'URL can only contain lowercase letters, numbers, and hyphens'
              if (value.length > 50) return 'URL is too long'
              return true
            }}
          />
        </div>
      </div>
    </Card>
  )
}
