'use client'

import { useCompany } from '@/hooks/useCompany'
import { StripeSection } from '@/components/stripe/StripeSection'
import { useStripe } from '@/hooks/useStripe'
import { useEffect, useState } from 'react'
import { StripeStatus } from '@/types/stripe'
import { toast } from 'sonner'
import { ProductList } from '@/components/stripe/ProductList'
import { useCompanyProducts } from '@/hooks/useCompanyProducts'

export default function ProductsPage() {
  const { company } = useCompany()
  const { products } = useCompanyProducts()

  const { checkStripeStatus, checking } = useStripe()
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchStripeStatus() {
      if (!company?.id) return

      const status = await checkStripeStatus()
      if (!mounted) return

      if (status.error) {
        toast.error(status.error)
        return
      }

      setStripeStatus(status)
    }

    fetchStripeStatus()

    return () => {
      mounted = false
    }
  }, [company?.id])

  if (!company) {
    return null
  }

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">Manage your products</p>
      </div>

      <div className="grid gap-8 mt-8">
        <StripeSection company={company} stripeStatus={stripeStatus} checking={checking} />
        {stripeStatus?.isConnected && stripeStatus.isEnabled && <ProductList products={products} />}
      </div>
    </div>
  )
}
