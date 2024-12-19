'use client'

import { useCallback, useState } from 'react'

import { useUserOperations } from '@/core/user/hooks/useUserOperations'

import { Card, InlineEdit, SuccessToast, ErrorToast } from '@/shared/components/ui'

import type { BaseUser } from '@/shared/types/auth'

interface AccountSectionProps {
  user: BaseUser
}

export function AccountSection({ user }: AccountSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { updateProfile } = useUserOperations()

  const handleSaveName = useCallback(
    async (newName: string) => {
      if (!user.email) return

      try {
        setIsLoading(true)
        await updateProfile({
          currentEmail: user.email,
          name: newName.trim(),
        })
        SuccessToast('Name updated successfully')
      } catch (error) {
        ErrorToast(error instanceof Error ? error.message : 'Failed to update name')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [user.email, updateProfile]
  )

  const handleSaveEmail = useCallback(
    async (newEmail: string) => {
      if (!user.email) return

      try {
        setIsLoading(true)
        await updateProfile({
          currentEmail: user.email,
          email: newEmail.trim(),
        })
        SuccessToast('Email updated successfully')
      } catch (error) {
        ErrorToast(error instanceof Error ? error.message : 'Failed to update email')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [user.email, updateProfile]
  )

  return (
    <Card>
      <div className="p-4 flex items-center justify-between gap-4">
        <label className="text-sm font-medium">Name</label>
        <InlineEdit
          value={user.name || ''}
          onSave={handleSaveName}
          saving={isLoading}
          className="w-[150px] text-right bg-muted"
          validate={(value) => {
            if (!value.trim()) return 'Name cannot be empty'
            if (value.length > 50) return 'Name is too long'
            return true
          }}
        />
      </div>

      <div className="p-4 flex items-center justify-between gap-4 border-t">
        <label className="text-sm font-medium">Email Address</label>
        <InlineEdit
          value={user.email || ''}
          onSave={handleSaveEmail}
          saving={isLoading}
          type="email"
          className="w-[150px] text-right bg-muted"
          validate={(value) => {
            if (!value.trim()) return 'Email cannot be empty'
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) return 'Please enter a valid email'
            return true
          }}
        />
      </div>
    </Card>
  )
}
