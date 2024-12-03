'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { CompanyProduct, CompanyProductEdge, ProductType } from '@/types/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '@/gql/mutations/company-product'
import { GET_COMPANY_PRODUCTS } from '@/gql/queries/company-products'
import { useCompany } from './useCompany'
import { toast } from 'sonner'

interface CreateProductInput {
  name: string
  description?: string | null
  type: ProductType
  priceAmount: number // in cents
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

export function useCompanyProducts() {
  const { user } = useUserStore()
  const { company } = useCompany()
  const [error, setError] = useState<string | null>(null)

  // Query products
  const {
    data,
    loading: loadingProducts,
    refetch,
  } = useQuery(GET_COMPANY_PRODUCTS, {
    variables: { companyId: company?.id },
    skip: !company?.id,
  })

  // Create product mutation
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

  const products =
    data?.company_productsCollection?.edges?.map((edge: CompanyProductEdge) => edge.node) ?? []

  const createProduct = async (input: CreateProductInput): Promise<CreateProductResponse> => {
    try {
      setError(null)

      if (!user?.company_id) {
        throw new Error('No company found')
      }

      const stripeResponse = await fetch('/api/stripe/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          company_id: user.company_id,
        }),
      })

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json()
        console.error('[useCompanyProducts] Stripe API error:', error)
        throw new Error(error.message || 'Failed to create Stripe product')
      }

      const stripeData = await stripeResponse.json()

      const result = await createProductMutation({
        variables: {
          input: {
            company_id: user.company_id,
            name: input.name,
            description: input.description || null,
            type: input.type,
            price_amount: input.priceAmount,
            currency: input.currency || 'USD',
            stripe_price_id: stripeData.stripe_price_id,
            stripe_product_id: stripeData.stripe_product_id,
            metadata: JSON.stringify(input.metadata || {}),
            is_active: true,
          },
        },
      })

      const newProduct = result.data?.insertIntocompany_productsCollection?.records?.[0]
      if (!newProduct) {
        throw new Error('Failed to create product in database')
      }

      // After successful creation, refetch the products
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

  const archiveProduct = async (productId: string): Promise<ArchiveProductResponse> => {
    try {
      const product = products.find((p: CompanyProduct) => p.id === productId)
      if (!product) {
        throw new Error('Product not found')
      }

      if (!user?.company_id) {
        throw new Error('No company found')
      }

      if (!product.stripe_price_id || !product.stripe_product_id) {
        throw new Error('Invalid Stripe product data')
      }

      const newActiveStatus = !product.is_active

      const stripeResponse = await fetch('/api/stripe/products/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripe_product_id: product.stripe_product_id,
          stripe_price_id: product.stripe_price_id,
          company_id: user.company_id,
          active: newActiveStatus,
        }),
      })

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json()
        throw new Error(error.message || 'Failed to update Stripe product status')
      }

      // 2. Update in database
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

      toast.success(`Product ${newActiveStatus ? 'restored' : 'archived'} successfully`)
      return { success: true }
    } catch (error) {
      console.error('[useCompanyProducts] Error updating product status:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update product status'
      toast.error(errorMessage)
      return { error: errorMessage }
    }
  }

  return {
    products,
    loadingProducts,
    createProduct,
    creating,
    error,
    refetch,
    archiveProduct,
  }
}
