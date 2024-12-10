'use client'

import { Card } from '@/components/ui'
import StripeConnectProvider from '@/providers/StripeConnectProvider'
import { useUserStore } from '@/stores/useUserStore'
import { ConnectPayments } from '@stripe/react-connect-js'

export default function HistoryPage() {
  const { user } = useUserStore()

  if (!user?.company_id) {
    return <div>No company found</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">History</h1>
      <p className="text-muted-foreground mt-2">
        View your transaction history and see how your business is performing.
      </p>
    </div>
  )
}
