'use client'

import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useUserOperations } from '@/core/user/hooks/useUserOperations'

import { Button, Card, Input, SuccessToast, ErrorToast } from '@/shared/components/ui'

import type { BaseUser } from '@/shared/types/auth'

interface ProfileForm {
  name: string
  email: string
}

interface ProfileSectionProps {
  user: BaseUser | null
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [form, setForm] = useState<ProfileForm>(() => ({
    name: user?.name || '',
    email: user?.email || '',
  }))
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { updateProfile } = useUserOperations()

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
      })
      setIsDirty(false)
    }
  }, [user])

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    const isChanged =
      field === 'name'
        ? value !== user?.name || form.email !== user?.email
        : value !== user?.email || form.name !== user?.name

    setIsDirty(isChanged)
  }

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
      })
      setIsDirty(false)
    }
  }

  const handleSave = async () => {
    if (!user?.email || !isDirty) return

    try {
      setIsLoading(true)
      await updateProfile({
        currentEmail: user.email,
        ...(form.name !== user.name && { name: form.name.trim() }),
        ...(form.email !== user.email && { email: form.email.trim() }),
      })
      setIsDirty(false)
      SuccessToast('Profile updated successfully')
    } catch (error) {
      handleCancel() // Reset form on error
      ErrorToast(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

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
          <Button size="sm" onClick={handleSave} disabled={isLoading}>
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
}
