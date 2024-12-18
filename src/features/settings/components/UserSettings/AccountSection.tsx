'use client'

import { Check, X } from 'lucide-react'
import { memo, useCallback, useState, useEffect } from 'react'

import { useUserOperations } from '@/core/user/hooks/useUserOperations'

import { Button, Card, Input, SuccessToast, ErrorToast } from '@/shared/components/ui'

import type { BaseUser } from '@/shared/types/auth'

interface AccountFormInput {
  name: string
  email: string
}

interface AccountFormProps {
  initialName: string
  initialEmail: string
  onSave: (form: AccountFormInput) => Promise<void>
  isLoading: boolean
}

const AccountForm = memo(function AccountForm({
  initialName,
  initialEmail,
  onSave,
  isLoading,
}: AccountFormProps) {
  const [form, setForm] = useState<AccountFormInput>(() => ({
    name: initialName,
    email: initialEmail,
  }))

  useEffect(() => {
    setForm({
      name: initialName,
      email: initialEmail,
    })
  }, [initialName, initialEmail])

  const handleChange = useCallback((field: keyof AccountFormInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleCancel = useCallback(() => {
    setForm({
      name: initialName,
      email: initialEmail,
    })
  }, [initialName, initialEmail])

  const handleSubmit = useCallback(async () => {
    await onSave(form)
  }, [form, onSave])

  const isDirty = form.name !== initialName || form.email !== initialEmail

  return (
    <>
      <Card>
        <div className="p-4 flex items-center justify-between gap-4">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="bg-muted border-0"
            placeholder="Enter your name"
            disabled={isLoading}
          />
        </div>

        <div className="p-4 flex items-center justify-between gap-4 border-t">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="bg-muted border-0"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>
      </Card>

      {isDirty && (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" onClick={handleSubmit} disabled={isLoading}>
            <Check className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      )}
    </>
  )
})

interface AccountSectionProps {
  user: BaseUser
}

export function AccountSection({ user }: AccountSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { updateProfile } = useUserOperations()

  const handleSave = useCallback(
    async (form: AccountFormInput) => {
      if (!user.email) return

      try {
        setIsLoading(true)
        await updateProfile({
          currentEmail: user.email,
          ...(form.name !== user.name && { name: form.name.trim() }),
          ...(form.email !== user.email && { email: form.email.trim() }),
        })
        SuccessToast('Profile updated successfully')
      } catch (error) {
        ErrorToast(error instanceof Error ? error.message : 'Failed to update profile')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [user.email, user.name, updateProfile]
  )

  return (
    <AccountForm
      initialName={user.name || ''}
      initialEmail={user.email || ''}
      onSave={handleSave}
      isLoading={isLoading}
    />
  )
}
