'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { CompanyProduct, ProductType } from '@/types/graphql'
import { useApolloClient } from '@apollo/client'
import { CREATE_PRODUCT } from '@/gql/mutations/company-product'

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

export function useCompanyProducts() {
  const client = useApolloClient()
  const { user } = useUserStore()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProduct = async (input: CreateProductInput): Promise<CreateProductResponse> => {
    try {
      setCreating(true)
      setError(null)

      if (!user?.company_id) {
        throw new Error('No company found')
      }

      // 1. Create Stripe product and price
      const stripeResponse = await fetch('/api/stripe/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!stripeResponse.ok) {
        const error = await stripeResponse.json()
        throw new Error(error.message || 'Failed to create Stripe product')
      }

      const { stripe_price_id, stripe_product_id } = await stripeResponse.json()

      // 2. Create product in database
      const { data } = await client.mutate({
        mutation: CREATE_PRODUCT,
        variables: {
          input: {
            company_id: user.company_id,
            name: input.name,
            description: input.description || null,
            type: input.type,
            price_amount: input.priceAmount,
            currency: input.currency || 'USD',
            stripe_price_id,
            stripe_product_id,
            metadata: input.metadata || {},
            is_active: true,
          },
        },
      })

      return {
        product: data.insertIntocompany_productsCollection.records[0],
        error: null,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      setError(errorMessage)
      return {
        product: null,
        error: errorMessage,
      }
    } finally {
      setCreating(false)
    }
  }

  return {
    createProduct,
    creating,
    error,
  }
}
