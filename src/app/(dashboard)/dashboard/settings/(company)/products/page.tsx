'use client'

import { useCompany } from '@/hooks/useCompany'
import { ConnectedAccount } from '@/components/stripe/ConnectedAccount'
import { useStripe } from '@/hooks/useStripe'
import { useEffect, useState, useCallback } from 'react'
import { StripeStatus } from '@/types/stripe'
import { toast } from 'sonner'
import { ProductList } from '@/components/stripe/ProductList'
import { useCompanyProducts } from '@/hooks/useCompanyProducts'
import type { CompanyProduct } from '@/types/graphql'

export default function ProductsPage() {
  const { company } = useCompany()
  const { checkStripeStatus, checking } = useStripe()
  const { listProducts, archiveProduct, syncProducts, products, loadingProducts } =
    useCompanyProducts()
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)
  const [syncNeeded, setSyncNeeded] = useState(false)

  const handleSync = useCallback(async () => {
    await syncProducts()
  }, [syncProducts])

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

  const handleEdit = useCallback((product: CompanyProduct) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', product.id)
  }, [])

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      if (!company?.id) return
      try {
        const status = await checkStripeStatus()
        if (!mounted) return

        if (status.error) {
          toast.error(status.error)
          return
        }

        setStripeStatus(status)

        if (status.isConnected && status.isEnabled) {
          const result = await listProducts()
          if (result.error) {
            toast.error(result.error)
            return
          }
          setSyncNeeded(result.syncNeeded)
        }
      } catch (error) {
        console.error('[ProductsPage] Error fetching data:', error)
        toast.error('Failed to fetch data')
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [company?.id])

  if (!company) return null

  return (
    <div className="p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">Manage your products</p>
      </div>

      <div className="grid gap-8 mt-8">
        <ConnectedAccount stripeStatus={stripeStatus} checking={checking} />
        {stripeStatus?.isConnected && stripeStatus.isEnabled && (
          <ProductList
            products={products}
            loading={loadingProducts}
            syncNeeded={syncNeeded}
            onSync={handleSync}
            onArchive={handleArchive}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  )
}
