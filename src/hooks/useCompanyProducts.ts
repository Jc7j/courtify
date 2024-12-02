'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { CompanyProduct, CompanyProductEdge, ProductType } from '@/types/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_PRODUCT, DELETE_PRODUCT, UPDATE_PRODUCT } from '@/gql/mutations/company-product'
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

interface DeleteProductResponse {
  success?: boolean
  error?: string
}

interface ArchiveProductResponse {
  success?: boolean
  error?: string
}

export function useCompanyProducts() {
  const { user } = useUserStore()
  const { company } = useCompany()
  const [error, setError] = useState<string | null>(null)

  console.log('[useCompanyProducts] User context:', {
    userId: user?.id,
    companyId: user?.company_id,
  })

  // Query products
  const {
    data,
    loading: loadingProducts,
    refetch,
  } = useQuery(GET_COMPANY_PRODUCTS, {
    variables: { companyId: company?.id },
    skip: !company?.id,
  })

  console.log('[useCompanyProducts] Query result:', {
    loading: loadingProducts,
    productsCount: data?.company_productsCollection?.edges?.length,
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

  const [deleteProductMutation, { loading: deleting }] = useMutation(DELETE_PRODUCT)

  const [archiveProductMutation] = useMutation(UPDATE_PRODUCT)

  const products =
    data?.company_productsCollection?.edges?.map((edge: CompanyProductEdge) => edge.node) ?? []

  const createProduct = async (input: CreateProductInput): Promise<CreateProductResponse> => {
    console.log('[useCompanyProducts] Creating product:', input)

    try {
      setError(null)

      if (!user?.company_id) {
        throw new Error('No company found')
      }

      // 1. Create Stripe product and price
      console.log('[useCompanyProducts] Calling Stripe API...')
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
      console.log('[useCompanyProducts] Stripe product created:', stripeData)

      // 2. Create product in database
      console.log('[useCompanyProducts] Creating product in database with input:', {
        company_id: user.company_id,
        name: input.name,
        type: input.type,
        price_amount: input.priceAmount,
        stripe_data: stripeData,
        metadata: input.metadata || {},
      })

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

      console.log('[useCompanyProducts] Product created in database:', newProduct)

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

  const deleteProduct = async (productId: string): Promise<DeleteProductResponse> => {
    try {
      // 1. Get the product details first
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

      // 2. Delete from Stripe first
      console.log('[useCompanyProducts] Deleting product from Stripe...')
      const stripeResponse = await fetch('/api/stripe/products/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripe_product_id: product.stripe_product_id,
          stripe_price_id: product.stripe_price_id,
          company_id: user.company_id,
        }),
      })

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json()
        throw new Error(error.message || 'Failed to delete Stripe product')
      }

      // 3. Delete from database
      const response = await deleteProductMutation({
        variables: { id: productId },
      })

      if (!response.data) {
        throw new Error('Failed to delete product from database')
      }

      // 4. Refetch products list
      await refetch()

      toast.success('Product deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('[useCompanyProducts] Error deleting product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product'
      toast.error(errorMessage)
      return { error: errorMessage }
    }
  }

  const archiveProduct = async (productId: string): Promise<ArchiveProductResponse> => {
    try {
      // 1. Get the product details first
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

      // 2. Archive in Stripe first
      console.log('[useCompanyProducts] Archiving product in Stripe...')
      const stripeResponse = await fetch('/api/stripe/products/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripe_product_id: product.stripe_product_id,
          stripe_price_id: product.stripe_price_id,
          company_id: user.company_id,
        }),
      })

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json()
        throw new Error(error.message || 'Failed to archive Stripe product')
      }

      // 3. Archive in database using UPDATE_PRODUCT
      const response = await archiveProductMutation({
        variables: {
          id: productId,
          set: {
            is_active: false,
            updated_at: new Date().toISOString(),
          },
        },
      })

      if (!response.data?.updatecompany_productsCollection?.records?.[0]) {
        throw new Error('Failed to archive product in database')
      }

      // 4. Refetch products list
      await refetch()

      toast.success('Product archived successfully')
      return { success: true }
    } catch (error) {
      console.error('[useCompanyProducts] Error archiving product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive product'
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
    deleting,
    deleteProduct,
    archiveProduct,
  }
}
