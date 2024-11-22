'use client'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui'

export function SecuritySection() {
  const handlePasswordChange = async () => {
    // TODO: Implement password change
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password and security preferences</CardDescription>
        </div>
        <Button variant="outline" onClick={handlePasswordChange} size="sm">
          Change Password
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-w-md">
          <label className="text-sm font-medium">Current Password</label>
          <Input type="password" value="••••••••" disabled className="bg-muted font-mono" />
        </div>
      </CardContent>
    </Card>
  )
}
