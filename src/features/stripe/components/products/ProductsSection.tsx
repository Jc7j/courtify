'use client'

import { Info, Plus, MoreHorizontal, Archive, RefreshCw, Pencil } from 'lucide-react'
import { memo, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/utils/cn'
import { formatCurrency } from '@/shared/lib/utils/format-currency'

import { ProductDialog } from './ProductDialog'

import type { CompanyProduct } from '@/shared/types/graphql'
import type { StripeStatus } from '@/shared/types/stripe'

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
  const [selectedProduct, setSelectedProduct] = useState<CompanyProduct | null>(null)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)

  if (stripeStatus === null) {
    return (
      <div className="divide-y rounded-lg border">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="h-5 w-32 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!stripeStatus.isConnected || !stripeStatus.isEnabled) {
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

      {syncNeeded && (
        <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50/50 px-4 py-3 dark:border-yellow-900/50 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Products need to be synced with Stripe. Please review and sync to update.
          </p>
          <Button
            onClick={onSync}
            variant="outline"
            size="sm"
            className="text-primary hover:text-primary-foreground hover:bg-primary"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Products
          </Button>
        </div>
      )}

      {loadingProducts ? (
        <div className="divide-y rounded-lg border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-5 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No products yet</p>
          <p className="text-xs text-muted-foreground">
            Create a product to start accepting payments
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <h3 className="font-medium">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {product.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant={product.is_active ? 'success' : 'secondary'}>
                    {product.is_active ? 'Active' : 'Archived'}
                  </Badge>
                  <Badge variant="outline">{product.stripe_payment_type || 'one_time'}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(product.price_amount / 100, product.currency)}
                  </p>
                </div>
                <ProductActions
                  product={product}
                  onEdit={() => setSelectedProduct(product)}
                  onArchive={() => {
                    setSelectedProduct(product)
                    setArchiveDialogOpen(true)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductDialog
        product={selectedProduct}
        open={!!selectedProduct && !archiveDialogOpen}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedProduct?.is_active ? 'Archive Product' : 'Restore Product'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProduct?.is_active
                ? `Are you sure you want to archive "${selectedProduct.name}"?`
                : `Are you sure you want to restore "${selectedProduct?.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedProduct) {
                  onArchive(selectedProduct.id)
                }
                setArchiveDialogOpen(false)
                setSelectedProduct(null)
              }}
              className={cn(
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                !selectedProduct?.is_active && 'bg-success hover:bg-success/90'
              )}
            >
              {selectedProduct?.is_active ? 'Archive' : 'Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ProductActions({
  product,
  onEdit,
  onArchive,
}: {
  product: CompanyProduct
  onEdit: () => void
  onArchive: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem onClick={onEdit} className="gap-2">
          <Pencil className="h-4 w-4" />
          <span>Edit product</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onArchive}
          className={cn(
            'gap-2',
            product.is_active
              ? 'text-yellow-600 dark:text-yellow-500'
              : 'text-emerald-600 dark:text-emerald-500'
          )}
        >
          <Archive className="h-4 w-4" />
          <span>{product.is_active ? 'Archive product' : 'Restore product'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const ProductsSection = memo(ProductsSectionComponent)
