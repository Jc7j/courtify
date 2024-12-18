'use client'

import { memo, useCallback, useState, Suspense } from 'react'

import { CompanyProfileSection } from '@/features/settings/components/CompanySettings/CompanyProfileSection'
import {
  DeleteSectionSkeleton,
  CompanyProfileSkeleton,
} from '@/features/settings/components/Skeletons'

import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'
import { useUserStore } from '@/core/user/hooks/useUserStore'

import { Input, Card, Button, Checkbox, ConfirmationDialog } from '@/shared/components/ui'
import { MemberRole } from '@/shared/types/graphql'

interface DeleteSectionProps {
  companyName: string
  onDelete: () => Promise<void>
  isDeleting: boolean
}

const DeleteSection = memo(function DeleteSection({
  companyName,
  onDelete,
  isDeleting,
}: DeleteSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  const handleDelete = useCallback(async () => {
    if (confirmName !== companyName || !acknowledged) return
    await onDelete()
    setShowDeleteDialog(false)
  }, [acknowledged, companyName, confirmName, onDelete])

  return (
    <>
      <Card>
        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <label className="text-sm font-medium">Delete Workspace</label>
            <p className="text-xs text-muted-foreground">
              Schedule workspace to be permanently deleted
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </div>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Verify workspace deletion request"
        description={
          <p>
            If you are sure you want to proceed with the deletion of the workspace{' '}
            <span className="font-medium">{companyName}</span>, please continue below.
          </p>
        }
        actionLabel="Delete my workspace"
        onConfirm={handleDelete}
        loading={isDeleting}
        variant="destructive"
        className="sm:max-w-md"
        disableConfirm={confirmName !== companyName || !acknowledged}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Keep in mind this operation is irreversible and will result in a complete deletion of
            all the data associated with the workspace.
          </p>
          <p className="text-sm text-muted-foreground">
            Data including but not limited to users, issues and comments will be permanently
            deleted.
          </p>
          <div className="space-y-2">
            <label htmlFor="confirm-name" className="text-sm font-medium">
              To confirm, type &quot;{companyName}&quot; in the box below.
            </label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={companyName}
              className="bg-muted border-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="confirm-delete"
              checked={acknowledged}
              onCheckedChange={(checked: boolean) => setAcknowledged(checked)}
              className="rounded border-input"
            />
            <label htmlFor="confirm-delete" className="text-sm">
              I acknowledge that all of the workspace data will be deleted and want to proceed.
            </label>
          </div>
        </div>
      </ConfirmationDialog>
    </>
  )
})

export default function SettingsPage() {
  const user = useUserStore((state) => state.user)
  const company = useCompanyStore((state) => state.company)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    if (!company) return
    setIsDeleting(true)
    // TODO: Implement delete functionality
    setIsDeleting(false)
  }, [company])

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Company Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your company profile and preferences</p>
      </div>

      <div className="grid gap-8 mt-8">
        <Suspense fallback={<CompanyProfileSkeleton />}>
          <CompanyProfileSection />
        </Suspense>

        {user?.role === MemberRole.Owner && (
          <Suspense fallback={<DeleteSectionSkeleton />}>
            <DeleteSection
              companyName={company?.name ?? ''}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}
