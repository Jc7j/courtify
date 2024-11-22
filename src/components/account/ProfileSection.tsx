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
} from '@/components/ui'
import { Check } from 'lucide-react'
import type { BaseUser } from '@/types/auth'

interface ProfileForm {
  name: string
  email: string
}

interface ProfileSectionProps {
  user: BaseUser | null
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    email: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
      })
    }
  }, [user])

  const hasChanges = () => {
    return form.name !== user?.name || form.email !== user?.email
  }

  const handleSave = async () => {
    // TODO: Implement save functionality
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account profile information</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges()} size="sm">
          <Check className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
