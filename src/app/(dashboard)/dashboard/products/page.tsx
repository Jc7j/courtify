'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'

import { ProductsSection } from '@/features/stripe/components/ProductsSection'
import { useStripe } from '@/features/stripe/hooks/useStripe'

import { useCompanyProducts } from '@/core/company/hooks/useCompanyProducts'
import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

import { Card, ErrorToast } from '@/shared/components/ui'

import type { StripeStatus } from '@/shared/types/stripe'

function ProductsContent() {
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
        console.error('[ProductsPage] Error fetching data:', error)
        ErrorToast('Failed to fetch data')
      }
    }

    fetchStripeStatus()
    return () => {
      mounted = false
    }
  }, [company?.id, company?.stripe_account_id, checkStripeStatus])

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

export default function ProductsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-2">
          Manage your rental products and equipment offerings.
        </p>
      </div>

      <Suspense
        fallback={
          <Card className="p-6 animate-pulse">
            <div className="h-8 w-64 bg-muted rounded-md mb-4" />
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded-md" />
              <div className="h-12 bg-muted rounded-md" />
            </div>
          </Card>
        }
      >
        <ProductsContent />
      </Suspense>
    </div>
  )
}
