'use client'

import { useApolloClient } from '@apollo/client'
import { useState, useMemo, useCallback, useEffect } from 'react'

import { SuccessToast, ErrorToast } from '@/shared/components/ui'

import { ProductServerService } from '../services/productServerService'

import type {
  UseCompanyProductsProps,
  CreateProductInput,
  ProductResponse,
  ArchiveProductResponse,
} from '../types'
import type { CompanyProduct } from '@/shared/types/graphql'

export function useCompanyProducts({ companyId }: UseCompanyProductsProps) {
  const client = useApolloClient()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<CompanyProduct[]>([])

  const productService = useMemo(() => new ProductServerService(client), [client])

  const fetchProducts = useCallback(async () => {
    if (!companyId) return []
    setLoading(true)
    try {
      const fetchedProducts = await productService.getProducts(companyId)
      setProducts(fetchedProducts)
      return fetchedProducts
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
      setError(errorMessage)
      ErrorToast(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [companyId, productService])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function createProduct(input: CreateProductInput): Promise<ProductResponse> {
    try {
      setError(null)
      setLoading(true)

      if (!companyId) {
        throw new Error('No company ID provided')
      }

      const stripeProduct = await productService.createStripeProduct(companyId, input)

      const result = await productService.createDatabaseProduct(companyId, {
        ...input,
        price_amount: stripeProduct.unit_amount,
        currency: stripeProduct.currency,
        stripe_price_id: stripeProduct.id,
        stripe_product_id: stripeProduct.product,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      await fetchProducts()

      SuccessToast('Product created successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      setError(errorMessage)
      ErrorToast(errorMessage)
      return { product: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  async function archiveProduct(productId: string): Promise<ArchiveProductResponse> {
    try {
      setError(null)
      setLoading(true)

      if (!companyId) {
        throw new Error('No company ID provided')
      }

      const product = products.find((p) => p.id === productId)

      if (!product) {
        throw new Error('Product not found')
      }

      if (!product.stripe_price_id || !product.stripe_product_id) {
        throw new Error('Invalid Stripe product data')
      }

      const newActiveStatus = !product.is_active

      await productService.archiveStripeProduct(
        companyId,
        product.stripe_product_id,
        product.stripe_price_id,
        newActiveStatus
      )

      const result = await productService.archiveDatabaseProduct(productId, newActiveStatus)

      if (result.error) {
        throw new Error(result.error)
      }

      await fetchProducts()

      SuccessToast(`Product ${newActiveStatus ? 'restored' : 'archived'} successfully`)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product status'
      setError(errorMessage)
      ErrorToast(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  async function updateProduct(
    productId: string,
    input: Partial<CompanyProduct>
  ): Promise<ProductResponse> {
    try {
      setError(null)
      setLoading(true)

      if (!companyId) {
        throw new Error('No company ID provided')
      }

      const stripeProduct = await productService.updateStripeProduct(
        companyId,
        input.stripe_product_id!,
        input.stripe_price_id!,
        {
          name: input.name,
          description: input.description || '',
          price_amount: input.price_amount,
        }
      )

      const result = await productService.updateDatabaseProduct(productId, {
        ...input,
        stripe_price_id: stripeProduct.id,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      await fetchProducts()

      SuccessToast('Product updated successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      setError(errorMessage)
      ErrorToast(errorMessage)
      return { product: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    archiveProduct,
    error,
    refetch: fetchProducts,
  }
}
