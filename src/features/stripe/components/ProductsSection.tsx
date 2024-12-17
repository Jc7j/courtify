'use client'

import { Info, Plus } from 'lucide-react'
import { memo } from 'react'

import { ProductDialog } from '@/features/stripe/components/ProductDialog'
import { ProductList } from '@/features/stripe/components/ProductList'

import { Button } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants/routes'
import { StripeStatus } from '@/shared/types/stripe'

import type { CompanyProduct } from '@/shared/types/graphql'

interface ProductsSectionProps {
  stripeStatus: StripeStatus | null
  products: CompanyProduct[]
  loadingProducts: boolean
  syncNeeded: boolean
  onSync: () => Promise<void>
  onArchive: (productId: string) => Promise<void>
}

function ProductsSectionComponent({
  stripeStatus,
  products,
  loadingProducts,
  syncNeeded,
  onSync,
  onArchive,
}: ProductsSectionProps) {
  if (!stripeStatus?.isConnected || !stripeStatus.isEnabled) {
    return <PaymentProcessingRequired />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Products & Pricing</h2>
          <p className="text-sm text-muted-foreground">
            Configure court rentals and equipment offerings
          </p>
        </div>
        <ProductDialog
          trigger={
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Product
            </Button>
          }
        />
      </div>

      <ProductList
        products={products}
        loading={loadingProducts}
        syncNeeded={syncNeeded}
        onSync={onSync}
        onArchive={onArchive}
      />
    </div>
  )
}

function PaymentProcessingRequired() {
  return (
    <div className="rounded-lg border bg-muted/5 p-8">
      <div className="flex items-start space-x-4">
        <Info className="h-6 w-6 text-muted-foreground mt-1" />
        <div>
          <h3 className="font-semibold mb-2">Payment Processing Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Stripe account to start managing products and accepting payments.
          </p>
          <a
            href={ROUTES.DASHBOARD.SETTINGS.PAYMENT_PROCESSOR}
            className="inline-flex items-center text-primary hover:underline text-sm font-medium group"
          >
            Go to Payment Settings
            <span className="ml-1 group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export const ProductsSection = memo(ProductsSectionComponent)
