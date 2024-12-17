import { Loader2 } from 'lucide-react'

import { Button } from '@/shared/components/ui'

interface ConnectStripePromptProps {
  onConnect: () => void
  connecting: boolean
}

export function ConnectStripePrompt({ onConnect, connecting }: ConnectStripePromptProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <h4 className="font-medium">Accept Payments with Stripe</h4>
        <ul className="mt-2 space-y-2">
          <li className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
            Provide business information
          </li>
          <li className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
            Set up bank account
          </li>
          <li className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
            Verify identity
          </li>
        </ul>
      </div>

      <Button className="w-full sm:w-auto" onClick={onConnect} disabled={connecting}>
        {connecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          'Connect Stripe Account'
        )}
      </Button>
    </div>
  )
}
