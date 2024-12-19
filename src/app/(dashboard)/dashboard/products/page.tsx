'use client'

import { Suspense } from 'react'

import { ProductsContent } from '@/features/stripe/components/products/ProductsContent'

import { Card } from '@/shared/components/ui'

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
