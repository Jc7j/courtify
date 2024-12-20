'use client'

import { useCallback } from 'react'

import { useUserOperations } from '@/core/user/hooks/useUserOperations'

import { Card, InlineEdit } from '@/shared/components/ui'

import type { BaseUser } from '@/shared/types/auth'

interface AccountSectionProps {
  user: BaseUser
}

export function AccountSection({ user }: AccountSectionProps) {
  const { updateProfile, loading, error } = useUserOperations()

  const handleSaveName = useCallback(
    async (newName: string) => {
      if (!user.email) return

      try {
        await updateProfile({
          currentEmail: user.email,
          name: newName.trim(),
        })
      } catch (err) {
        console.error('[Account Section] Name update error:', {
          error: err instanceof Error ? err.message : 'Unknown error',
          userId: user.id,
          newName,
        })
        throw err
      }
    },
    [user.email, updateProfile]
  )

  const handleSaveEmail = useCallback(
    async (newEmail: string) => {
      if (!user.email) return

      try {
        await updateProfile({
          currentEmail: user.email,
          email: newEmail.trim(),
        })
      } catch (err) {
        console.error('[Account Section] Email update error:', {
          error: err instanceof Error ? err.message : 'Unknown error',
          userId: user.id,
          newEmail,
        })
        throw err
      }
    },
    [user.email, updateProfile]
  )

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">{error.message}</p>
      </div>
    )
  }

  return (
    <Card>
      <div className="p-4 flex items-center justify-between gap-4">
        <label className="text-sm font-medium">Name</label>
        <InlineEdit
          value={user.name || ''}
          onSave={handleSaveName}
          saving={loading}
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
          saving={loading}
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
