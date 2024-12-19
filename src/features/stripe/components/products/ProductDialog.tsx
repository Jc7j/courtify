'use client'

import { FormEvent, useState, useEffect } from 'react'

import { useCompanyProducts } from '@/core/company/hooks/useCompanyProducts'
import { CreateProductInput } from '@/core/company/types'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/components/ui'
import { CompanyProduct, ProductType, StripePaymentType } from '@/shared/types/graphql'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  product?: CompanyProduct | null
}

const defaultFormData: CreateProductInput = {
  name: '',
  description: '',
  type: ProductType.CourtRental,
  price_amount: 0,
  stripe_payment_type: StripePaymentType.OneTime,
  currency: 'usd',
}

export function ProductDialog({ open, onOpenChange, companyId, product }: ProductDialogProps) {
  const { createProduct, updateProduct, loading } = useCompanyProducts({ companyId })
  const [formData, setFormData] = useState<CreateProductInput>(defaultFormData)
  const isEditing = !!product

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        type: product.type as ProductType,
        price_amount: product.price_amount / 100, // Convert from cents to dollars
        stripe_payment_type: product.stripe_payment_type as StripePaymentType,
        currency: product.currency || 'usd',
        stripe_product_id: product.stripe_product_id || undefined,
        stripe_price_id: product.stripe_price_id || undefined,
      })
    } else {
      setFormData(defaultFormData)
    }
  }, [product, open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!formData.name || !formData.type || !formData.price_amount) {
      return
    }

    const priceInCents = Math.round(formData.price_amount * 100) // This is correct

    if (isEditing && product) {
      await updateProduct(product.id, {
        ...formData,
        price_amount: priceInCents,
      })
    } else {
      await createProduct({
        ...formData,
        price_amount: priceInCents,
      })
    }

    setFormData(defaultFormData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Create Product'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your product details.'
              : 'Add a new product or service to your company.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: ProductType) => setFormData({ ...formData, type: value })}
              disabled={isEditing} // Prevent type changes for existing products
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price_amount || ''}
              onChange={(e) =>
                setFormData({ ...formData, price_amount: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-type">Payment Type</Label>
            <Select
              value={formData.stripe_payment_type}
              onValueChange={(value: StripePaymentType) =>
                setFormData({ ...formData, stripe_payment_type: value })
              }
              disabled={isEditing} // Prevent payment type changes for existing products
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a payment type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(StripePaymentType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Product'
                  : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
