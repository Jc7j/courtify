'use client'

import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'

import { SuccessToast, ErrorToast, WarningToast } from '@/shared/components/ui'
import {
  CompanyProduct,
  CompanyProductEdge,
  ProductType,
  StripePaymentType,
} from '@/shared/types/graphql'

import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../graphql/mutations'
import { GET_COMPANY_PRODUCTS } from '../graphql/queries'

interface CreateProductInput {
  name: string
  description?: string | null
  type: ProductType
  priceAmount: number
  stripePaymentType: StripePaymentType
  currency?: string
  metadata?: Record<string, unknown>
}

interface CreateProductResponse {
  product: CompanyProduct | null
  error: string | null
}

interface ArchiveProductResponse {
  success?: boolean
  error?: string
}

interface StripeProduct {
  id: string
  product: string
  active: boolean
  currency: string
  unit_amount: number
  metadata: Record<string, unknown>
  type: string
  recurring?: {
    interval: string
    interval_count: number
  }
}

interface useCompanyProductsProps {
  companyId?: string
}

export function useCompanyProducts({ companyId }: useCompanyProductsProps) {
  const [error, setError] = useState<string | null>(null)
  const [syncNeeded, setSyncNeeded] = useState(false)

  const {
    data,
    loading: loadingProducts,
    refetch,
  } = useQuery(GET_COMPANY_PRODUCTS, {
    variables: { companyId },
    skip: !companyId,
  })

  const [createProductMutation, { loading: creating }] = useMutation(CREATE_PRODUCT, {
    update(cache, { data }) {
      const newProduct = data?.insertIntocompany_productsCollection?.records?.[0]
      if (newProduct) {
        cache.evict({ fieldName: 'company_productsCollection' })
        cache.gc()
      }
    },
  })

  const [archiveProductMutation] = useMutation(UPDATE_PRODUCT)

  const [updateProductMutation] = useMutation(UPDATE_PRODUCT, {
    update(cache, { data }) {
      const updatedProduct = data?.updatecompany_productsCollection?.records?.[0]
      if (updatedProduct) {
        cache.evict({ fieldName: 'company_productsCollection' })
        cache.gc()
      }
    },
  })

  const products =
    data?.company_productsCollection?.edges?.map((edge: CompanyProductEdge) => edge.node) ?? []

  async function createProduct(input: CreateProductInput): Promise<CreateProductResponse> {
    try {
      setError(null)

      if (!companyId) {
        throw new Error('No company ID provided')
      }

      const stripeResponse = await fetch('/api/stripe/prices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          companyId,
        }),
      })

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json()
        throw new Error(error.message || 'Failed to create Stripe product')
      }

      const stripeData = await stripeResponse.json()
      const result = await createProductMutation({
        variables: {
          input: {
            company_id: companyId,
            name: input.name,
            description: input.description || null,
            type: input.type,
            price_amount: stripeData.unit_amount,
            currency: stripeData.currency,
            stripe_price_id: stripeData.id,
            stripe_product_id: stripeData.product,
            stripe_payment_type: stripeData.type as StripePaymentType,
            metadata: JSON.stringify({
              stripe_metadata: stripeData.metadata,
              created_at: new Date().toISOString(),
              price_details: {
                currency: stripeData.currency,
                original_amount: input.priceAmount,
                unit_amount: stripeData.unit_amount,
              },
            }),
            is_active: true,
          },
        },
      })

      const newProduct = result.data?.insertIntocompany_productsCollection?.records?.[0]
      if (!newProduct) {
        throw new Error('Failed to create product in database')
      }

      await refetch()

      return {
        product: newProduct,
        error: null,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      console.error('[useCompanyProducts] Error creating product:', err)
      setError(errorMessage)
      return {
        product: null,
        error: errorMessage,
      }
    }
  }

  async function archiveProduct(productId: string): Promise<ArchiveProductResponse> {
    try {
      const product = products.find((p: CompanyProduct) => p.id === productId)
      if (!product) {
        throw new Error('Product not found')
      }

      if (!companyId) {
        throw new Error('No company ID provided')
      }

      if (!product.stripe_price_id || !product.stripe_product_id) {
        throw new Error('Invalid Stripe product data')
      }

      const newActiveStatus = !product.is_active

      const stripeResponse = await fetch('/api/stripe/prices/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripe_product_id: product.stripe_product_id,
          stripe_price_id: product.stripe_price_id,
          company_id: companyId,
          active: newActiveStatus,
        }),
      })

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json()
        throw new Error(error.message || 'Failed to update Stripe product status')
      }

      const response = await archiveProductMutation({
        variables: {
          id: productId,
          set: {
            is_active: newActiveStatus,
            updated_at: new Date().toISOString(),
          },
        },
      })

      if (!response.data?.updatecompany_productsCollection?.records?.[0]) {
        throw new Error('Failed to update product status')
      }

      await refetch()

      SuccessToast(`Product ${newActiveStatus ? 'restored' : 'archived'} successfully`)
      return { success: true }
    } catch (error) {
      console.error('[useCompanyProducts] Error updating product status:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update product status'
      ErrorToast(errorMessage)
      return { error: errorMessage }
    }
  }

  async function listProducts() {
    try {
      if (!companyId) {
        throw new Error('No company ID provided')
      }

      const response = await fetch('/api/stripe/prices/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to list Stripe prices')
      }

      const { data: queryData } = await refetch()
      const currentDatabaseProducts =
        queryData?.company_productsCollection?.edges?.map(
          (edge: CompanyProductEdge) => edge.node
        ) || []

      const stripePrices = data.prices || []
      const activeDbProducts = currentDatabaseProducts.filter((p: CompanyProduct) => p.is_active)
      const hasMismatch = activeDbProducts.some((dbProduct: CompanyProduct) => {
        const existsInStripe = stripePrices.some(
          (price: StripeProduct) => price.product === dbProduct.stripe_product_id
        )
        return !existsInStripe
      })

      if (hasMismatch) {
        setSyncNeeded(true)
        WarningToast('Products are out of sync with Stripe. Click "Sync Products" to update.')
      }

      return {
        prices: stripePrices,
        products: currentDatabaseProducts,
        syncNeeded: activeDbProducts.length > 0 && hasMismatch,
        error: null,
      }
    } catch (error) {
      console.error('Error listing products:', error)
      return {
        prices: null,
        databaseProducts: [],
        syncNeeded: false,
        error: error instanceof Error ? error.message : 'Failed to list products',
      }
    }
  }

  async function syncProducts() {
    try {
      if (!companyId) {
        throw new Error('No company ID provided')
      }

      const { data: queryData } = await refetch()
      const databaseProducts =
        queryData?.company_productsCollection?.edges?.map(
          (edge: CompanyProductEdge) => edge.node
        ) || []

      const stripeResponse = await fetch('/api/stripe/prices/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId }),
      })

      if (!stripeResponse.ok) {
        throw new Error('Failed to fetch Stripe prices')
      }

      const { prices: stripePrices } = await stripeResponse.json()

      const productsToCreate = databaseProducts.filter((dbProduct: CompanyProduct) => {
        const isActive = dbProduct.is_active
        const existsInStripe = stripePrices.some(
          (price: StripeProduct) => price.product === dbProduct.stripe_product_id
        )

        return isActive && !existsInStripe
      })

      for (const product of productsToCreate) {
        const response = await fetch('/api/stripe/prices/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: companyId,
            name: product.name,
            description: product.description,
            type: product.type,
            priceAmount: product.price_amount,
            currency: product.currency,
            metadata: product.metadata,
          }),
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create Stripe product')
        }

        const { stripe_price_id, stripe_product_id } = await response.json()

        const updateResult = await updateProductMutation({
          variables: {
            id: product.id,
            set: {
              stripe_price_id,
              stripe_product_id,
              updated_at: new Date().toISOString(),
            },
          },
        })

        if (!updateResult.data?.updatecompany_productsCollection?.records?.[0]) {
          console.error('Failed to update product in database:', updateResult)
          throw new Error('Failed to update product in database')
        }
      }

      await refetch()
      setSyncNeeded(false)
      SuccessToast('Products synced to Stripe successfully')
    } catch (error) {
      console.error('[useCompanyProducts] Error syncing products:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync products'
      ErrorToast(errorMessage)
      setError(errorMessage)
    }
  }

  async function updateProduct(
    productId: string,
    input: CreateProductInput
  ): Promise<CreateProductResponse> {
    try {
      setError(null)

      if (!companyId) {
        throw new Error('No company ID provided')
      }

      const existingProduct = products.find((p: CompanyProduct) => p.id === productId)
      if (!existingProduct) {
        throw new Error('Product not found')
      }

      const stripeResponse = await fetch('/api/stripe/prices/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          companyId,
          productId: existingProduct.id,
          stripePriceId: existingProduct.stripe_price_id,
          stripeProductId: existingProduct.stripe_product_id,
        }),
      })

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json()
        throw new Error(error.message || 'Failed to update Stripe price')
      }

      const stripeData = await stripeResponse.json()

      const result = await updateProductMutation({
        variables: {
          id: productId,
          set: {
            name: input.name,
            description: input.description || null,
            type: input.type,
            price_amount: Math.round(input.priceAmount),
            stripe_payment_type: input.stripePaymentType,
            stripe_price_id: stripeData.stripePriceId,
            metadata: JSON.stringify({
              ...JSON.parse(existingProduct.metadata || '{}'),
              updated_at: new Date().toISOString(),
              price_details: {
                currency: existingProduct.currency,
                original_amount: input.priceAmount,
                unit_amount: Math.round(input.priceAmount),
              },
            }),
            updated_at: new Date().toISOString(),
          },
        },
      })

      const updatedProduct = result.data?.updatecompany_productsCollection?.records?.[0]
      if (!updatedProduct) {
        throw new Error('Failed to update product in database')
      }

      await refetch()
      SuccessToast('Product updated successfully')

      return {
        product: updatedProduct,
        error: null,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      console.error('[useCompanyProducts] Error updating product:', err)
      setError(errorMessage)
      ErrorToast(errorMessage)
      return {
        product: null,
        error: errorMessage,
      }
    }
  }

  return {
    products,
    loadingProducts,
    createProduct,
    updateProduct,
    creating,
    error,
    refetch,
    archiveProduct,
    listProducts,
    syncProducts,
    syncNeeded,
  }
}
