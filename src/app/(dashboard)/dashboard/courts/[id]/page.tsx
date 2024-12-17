'use client'

import { ArrowLeft, Pencil, Save, Trash2, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { memo, useCallback, useState } from 'react'

import { CourtsErrorBoundary } from '@/features/courts/components/CourtsErrorBoundary'
import { CourtDetailSkeleton } from '@/features/courts/components/Skeletons'
import { useCourt } from '@/features/courts/hooks/useCourt'

import { Button, Input, ConfirmationDialog, SuccessToast, ErrorToast } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants/routes'

interface CourtEditorProps {
  initialName: string
  isEditing: boolean
  updating: boolean
  onSave: (name: string) => Promise<void>
  onCancel: () => void
  onEdit: () => void
}

const CourtEditor = memo(function CourtEditorComponent({
  initialName,
  isEditing,
  updating,
  onSave,
  onCancel,
  onEdit,
}: CourtEditorProps) {
  const [newName, setNewName] = useState(initialName)

  if (isEditing) {
    return (
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
          onClick={() => onSave(newName)}
          disabled={updating || newName === initialName || !newName.trim()}
        >
          <Save className="h-4 w-4 text-primary" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onCancel} disabled={updating}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-semibold">{initialName}</h1>
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  )
})

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  loading: boolean
}

function DeleteDialog({ open, onOpenChange, onConfirm, loading }: DeleteDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Court"
      description="Are you sure you want to delete this court? This action cannot be undone."
      actionLabel="Delete"
      onConfirm={onConfirm}
      loading={loading}
      variant="destructive"
    />
  )
}

export default function CourtPage() {
  const params = useParams()
  const router = useRouter()
  const courtNumber = parseInt(params.id as string)

  const { court, updateCourt, deleteCourt, updating, deleting } = useCourt(courtNumber)

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSave = useCallback(
    async (newName: string) => {
      try {
        await updateCourt(courtNumber, newName)
        setIsEditing(false)
        SuccessToast('Court updated successfully')
      } catch (err) {
        ErrorToast(err instanceof Error ? err.message : 'Failed to update court')
      }
    },
    [courtNumber, updateCourt]
  )

  const handleDelete = useCallback(async () => {
    try {
      await deleteCourt(courtNumber)
      SuccessToast('Court deleted successfully')
      router.push(`${ROUTES.DASHBOARD.HOME}/courts?tab=courts`)
    } catch (err) {
      ErrorToast(err instanceof Error ? err.message : 'Failed to delete court')
    }
  }, [courtNumber, deleteCourt, router])

  const handleCancel = () => setIsEditing(false)
  const handleEdit = () => setIsEditing(true)

  if (!court) {
    return <CourtDetailSkeleton />
  }

  return (
    <CourtsErrorBoundary>
      <div className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <CourtEditor
              initialName={court.name}
              isEditing={isEditing}
              updating={updating}
              onSave={handleSave}
              onCancel={handleCancel}
              onEdit={handleEdit}
            />
          </div>

          <Button
            variant="outline-destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="ml-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Court
          </Button>
        </div>

        <DeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          loading={deleting}
        />
      </div>
    </CourtsErrorBoundary>
  )
}
