'use client'

import { useState } from 'react'

import { CompanyProfileSection } from '@/features/settings/components/CompanySettings/CompanyProfileSection'
import { useCompany } from '@/core/company/hooks/useCompany'

import { Input, Card, Button, Checkbox, ConfirmationDialog } from '@/shared/components/ui'
import { useUserStore } from '@/core/user/hooks/useUserStore'
import { MemberRole } from '@/shared/types/graphql'

export default function SettingsPage() {
  const { user } = useUserStore()
  const { company, loading: companyLoading } = useCompany()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  const handleDelete = async () => {
    if (!company || confirmName !== company.name || !acknowledged) return
    setIsDeleting(true)
    // TODO: Implement delete functionality
    setIsDeleting(false)
    setShowDeleteDialog(false)
  }

  if (!company) {
    return (
      <div className="p-8 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">No company data found</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Company Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your company profile and preferences</p>
      </div>

      <div className="grid gap-8 mt-8">
        <CompanyProfileSection company={company} loading={companyLoading} />

        {/* Only show delete section for owners */}
        {user?.role === MemberRole.Owner && (
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
        )}
      </div>

      {/* Dialog will only be accessible to owners due to conditional rendering above */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Verify workspace deletion request"
        description={
          <p>
            If you are sure you want to proceed with the deletion of the workspace{' '}
            <span className="font-medium">{company?.name}</span>, please continue below.
          </p>
        }
        actionLabel="Delete my workspace"
        onConfirm={handleDelete}
        loading={isDeleting}
        variant="destructive"
        className="sm:max-w-md"
        disableConfirm={confirmName !== company?.name || !acknowledged}
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
              To confirm, type &quot;{company?.name}&quot; in the box below.
            </label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={company?.name}
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
    </div>
  )
}
