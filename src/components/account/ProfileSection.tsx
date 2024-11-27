'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  error as toastError,
  success as toastSuccess,
} from '@/components/ui'
import { Check } from 'lucide-react'
import type { BaseUser } from '@/types/auth'
import { useUserOperations } from '@/hooks/useUserOperations'

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

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
      })
      setIsDirty(false)
    }
  }, [user])

  function handleChange(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (!isDirty && value !== (user?.[field] || '')) {
      setIsDirty(true)
    }
  }

  function handleCancel() {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
      })
      setIsDirty(false)
    }
  }

  async function handleSave() {
    if (!user?.email || !isDirty) return

    try {
      setIsLoading(true)
      await updateProfile({
        currentEmail: user.email,
        ...(form.name !== user.name && { name: form.name }),
        ...(form.email !== user.email && { email: form.email }),
      })
      setIsDirty(false)
      toastSuccess('Profile updated successfully')
    } catch (error) {
      handleCancel() // Reset form on error
      toastError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account profile information</CardDescription>
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <Button onClick={handleCancel} variant="outline" size="sm" disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={!isDirty || isLoading} size="sm">
            <Check className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your name"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
