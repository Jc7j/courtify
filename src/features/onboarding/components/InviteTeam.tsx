'use client'

import { ArrowLeft, Plus, X } from 'lucide-react'
import { useState } from 'react'

import { Button, Input } from '@/shared/components/ui'

interface InviteTeamProps {
  onBack?: () => void
  onComplete: () => void
}

export function InviteTeam({ onBack, onComplete }: InviteTeamProps) {
  const [emails, setEmails] = useState<string[]>(['', '', ''])

  function handleEmailChange(index: number, value: string) {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  function addEmailField() {
    setEmails([...emails, ''])
  }

  function removeEmailField(index: number) {
    if (emails.length <= 3) return // Keep minimum 3 fields
    const newEmails = emails.filter((_, i) => i !== index)
    setEmails(newEmails)
  }

  async function handleSubmit() {
    const validEmails = emails.filter((email) => email.trim() !== '')

    if (validEmails.length === 0) {
      onComplete() // Skip if no emails
      return
    }

    // TODO: Implement email invitations
    onComplete()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Invite your team</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Invite team members to help manage your courts and bookings.
        </p>
      </div>

      <div className="space-y-4">
        {emails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="email"
              placeholder="team@example.com"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              className="flex-1 "
            />
            {index >= 3 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeEmailField(index)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addEmailField} className="gap-2">
          <Plus className="h-4 w-4" />
          Add another
        </Button>
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <Button onClick={handleSubmit} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  )
}
