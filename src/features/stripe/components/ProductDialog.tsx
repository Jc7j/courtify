'use client'

import { useState, FormEvent, useEffect, ReactNode } from 'react'

import { useCompanyProducts } from '@/core/company/hooks/useCompanyProducts'

import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/shared/components/ui'
import { ProductType, StripePaymentType, CompanyProduct } from '@/shared/types/graphql'

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: ProductType.CourtRental, label: 'Court Rental' },
  { value: ProductType.Equipment, label: 'Equipment' },
]

interface ProductDialogProps {
  product?: CompanyProduct | null
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  companyId?: string
}

export function ProductDialog({
  product,
  open,
  onOpenChange,
  trigger,
  companyId,
}: ProductDialogProps) {
  const { createProduct, updateProduct, creating } = useCompanyProducts({ companyId })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'court_rental' as ProductType,
    priceAmount: '',
    stripePaymentType: 'one_time' as StripePaymentType,
  })

  const isEditing = !!product

  useEffect(() => {
    if (open && product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        type: product.type as ProductType,
        priceAmount: (product.price_amount / 100).toString(),
        stripePaymentType: product.stripe_payment_type as StripePaymentType,
      })
    } else if (!open) {
      setFormData({
        name: '',
        description: '',
        type: 'court_rental' as ProductType,
        priceAmount: '',
        stripePaymentType: 'one_time' as StripePaymentType,
      })
    }
  }, [open, product])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    try {
      const productData = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        priceAmount: Math.round(parseFloat(formData.priceAmount) * 100),
        stripePaymentType: formData.stripePaymentType,
      }

      if (isEditing && product) {
        await updateProduct(product.id, productData)
      } else {
        await createProduct(productData)
      }

      onOpenChange?.(false)
    } catch (error) {
      console.error('❌ Form submission error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Create New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Make changes to your product'
              : 'Your customers will see this product in their checkout flow.'}
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: ProductType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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
              value={formData.priceAmount}
              onChange={(e) => setFormData({ ...formData, priceAmount: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={creating}>
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
