'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { ArrowLeft, Pencil, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useCourt } from '@/hooks/useCourt'
import { toast } from 'sonner'
import { CourtCalendar } from '@/components/courts/CourtCalendar'

export default function CourtPage() {
  const params = useParams()
  const router = useRouter()
  const courtNumber = parseInt(params.id as string)
  const { court, courtLoading, updateCourt, deleteCourt, updating, deleting } =
    useCourt(courtNumber)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(court?.name || '')

  // Loading state
  if (courtLoading || !court) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="animate-pulse h-8 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  async function handleSave() {
    try {
      await updateCourt(courtNumber, newName)
      setIsEditing(false)
      toast.success('Court updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update court')
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this court?')) return

    try {
      await deleteCourt(courtNumber)
      toast.success('Court deleted successfully')
      router.back()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete court')
    }
  }

  function handleCancel() {
    setNewName(court?.name || '')
    setIsEditing(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="max-w-xs"
                autoFocus
                disabled={updating}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={updating || newName === court.name || !newName.trim()}
              >
                <Save className="h-4 w-4 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancel} disabled={updating}>
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{court.name}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNewName(court.name)
                  setIsEditing(true)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Court
        </Button>
      </div>

      {/* Calendar Section with Loading State */}
      {courtLoading ? (
        <div className="mt-8 bg-background border rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-full" />
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        court && <CourtCalendar court={court} />
      )}
    </div>
  )
}
