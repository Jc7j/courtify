'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button, Input, success, error as toastError } from '@/components/ui'
import { ArrowLeft, Pencil, Save, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCourt } from '@/hooks/useCourt'
import { useUser } from '@/hooks/useUser'
import type { Courts } from '@/types/graphql'

export default function CourtPage() {
  const params = useParams()
  const router = useRouter()
  const { getCourt, updateCourt, updating, courtLoading } = useCourt()
  const { user, loading: userLoading } = useUser()
  const [court, setCourt] = useState<Courts | null>(null)
  const courtNumber = parseInt(params.id as string)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState('')

  // Fetch court data
  useEffect(() => {
    async function fetchCourt() {
      // Wait for user data to be available
      if (userLoading || !user?.company_id) return

      try {
        const courtData = await getCourt(courtNumber)
        if (courtData) {
          setCourt(courtData)
          setNewName(courtData.name)
        }
      } catch (err) {
        toastError('Failed to load court')
        router.back()
      }
    }

    fetchCourt()
  }, [courtNumber, getCourt, router, user?.company_id, userLoading])

  // Show loading state while waiting for user or court data
  if (userLoading || courtLoading || !court) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  async function handleSave() {
    try {
      await updateCourt(courtNumber, newName)
      setIsEditing(false)
      setCourt((prev) => (prev ? { ...prev, name: newName } : null))
      success('Court updated successfully')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update court')
    }
  }

  function handleCancel() {
    setNewName(court?.name || '')
    setIsEditing(false)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          {isEditing ? (
            <>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="max-w-xs"
                autoFocus
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
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-foreground group flex items-center gap-2">
                <span className="text-xl font-bold text-foreground flex items-center gap-2">
                  {court.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </span>
              </h1>
            </>
          )}
        </div>
      </div>

      {/* Court details and management will go here */}
      <div className="border rounded-lg p-6">
        <p className="text-muted-foreground">Court details coming soon...</p>
      </div>
    </div>
  )
}
