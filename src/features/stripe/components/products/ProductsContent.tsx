'use client'

import { useCallback, useEffect, useState } from 'react'

import { useStripe } from '@/features/stripe/hooks/useStripe'

import { useCompanyProducts } from '@/core/company/hooks/useCompanyProducts'
import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

import { Card, ErrorToast } from '@/shared/components/ui'

import { ProductsSection } from './ProductsSection'

import type { StripeStatus } from '@/shared/types/stripe'

export function ProductsContent() {
  const company = useCompanyStore((state) => state.company)
  const { checkStripeStatus } = useStripe()
  const { listProducts, archiveProduct, syncProducts, products, loadingProducts } =
    useCompanyProducts({
      companyId: company?.id,
    })

  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)
  const [syncNeeded, setSyncNeeded] = useState(false)

  const handleSync = useCallback(() => syncProducts(), [syncProducts])

  const handleArchive = useCallback(
    async (productId: string) => {
      const result = await archiveProduct(productId)
      if (!result.error) {
        const productsResult = await listProducts()
        if (!productsResult.error) {
          setSyncNeeded(productsResult.syncNeeded)
        }
      }
    },
    [archiveProduct, listProducts]
  )

  // Fetch Stripe status
  useEffect(() => {
    let mounted = true

    async function fetchStripeStatus() {
      if (!company?.id || !company.stripe_account_id) return
      try {
        const status = await checkStripeStatus()
        if (!mounted) return

        if (status.error) {
          ErrorToast(status.error)
          return
        }

        setStripeStatus(status)
      } catch (error) {
        if (!mounted) return
        console.error('[ProductsContent] Error fetching data:', error)
        ErrorToast('Failed to fetch data')
      }
    }

    fetchStripeStatus()
    return () => {
      mounted = false
    }
  }, [company?.id, company?.stripe_account_id, checkStripeStatus])

  // Check product sync status
  useEffect(() => {
    if (!stripeStatus?.isConnected || !stripeStatus.isEnabled) return

    let mounted = true

    async function syncProductsStatus() {
      try {
        const result = await listProducts()
        if (!mounted) return

        if (result.error) {
          ErrorToast(result.error)
          return
        }
        setSyncNeeded(result.syncNeeded)
      } catch (error) {
        if (!mounted) return
        ErrorToast(
          `Failed to sync products: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    syncProductsStatus()
    return () => {
      mounted = false
    }
  }, [stripeStatus?.isConnected, stripeStatus?.isEnabled, listProducts])

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <ProductsSection
        stripeStatus={stripeStatus}
        products={products}
        loadingProducts={loadingProducts}
        syncNeeded={syncNeeded}
        onSync={handleSync}
        onArchive={handleArchive}
      />
    </Card>
  )
}
