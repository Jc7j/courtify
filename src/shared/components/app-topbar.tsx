'use client'

import { MessageSquarePlus, Copy, Check } from 'lucide-react'
import { useState, useCallback } from 'react'

import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'
import { useUserStore } from '@/core/user/hooks/useUserStore'

import { SuccessToast, ErrorToast } from '@/shared/components/ui'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/utils/cn'

const BOOKING_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://courtify.app'

export function AppTopbar({ className }: { className?: string }) {
  const company = useCompanyStore((state) => state.company)
  const user = useUserStore((state) => state.user)
  const [feedback, setFeedback] = useState('')
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopySlug = useCallback(async () => {
    if (!company?.slug) return
    const bookingUrl = `${BOOKING_BASE_URL}/book/${company.slug}`
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [company?.slug])

  const handleSubmit = async () => {
    if (!feedback.trim()) return

    setSending(true)
    try {
      const response = await fetch('/api/send/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })

      if (!response.ok) throw new Error('Failed to send feedback')

      SuccessToast('Thank you for your feedback!')
      setOpen(false)
      setFeedback('')
    } catch (error) {
      ErrorToast('Failed to send feedback. Please try again.')
      console.error('Failed to send feedback:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center border-b border-border bg-background px-4 lg:px-6',
        className
      )}
    >
      {/* Left side - Header */}
      <div className="flex flex-1 items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name}</h1>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {company?.slug && (
          <Button variant="outline" size="sm" onClick={handleCopySlug} className="gap-2">
            <span className="text-xs">Booking link</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquarePlus className="h-4 w-4" />
              Feedback
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Send Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Help us improve Courtify by sharing your thoughts.
                </p>
              </div>
              <Textarea
                placeholder="Your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
                disabled={sending}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false)
                    setFeedback('')
                  }}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={!feedback.trim() || sending}>
                  {sending ? 'Sending...' : 'Send Feedback'}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
