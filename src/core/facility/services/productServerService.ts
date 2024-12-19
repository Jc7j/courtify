import { ApolloClient } from '@apollo/client'

import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../graphql/mutations'
import { GET_FACILITY_PRODUCTS } from '../graphql/queries'

import type {
  CreateProductInput,
  ProductResponse,
  ArchiveProductResponse,
  StripeProduct,
} from '../types'
import type { FacilityProduct } from '@/shared/types/graphql'

export class ProductServerService {
  constructor(private client: ApolloClient<unknown>) {}

  async getProducts(facilityId: string) {
    const { data } = await this.client.query({
      query: GET_FACILITY_PRODUCTS,
      variables: { facilityId },
      fetchPolicy: 'network-only',
    })

    return data?.facility_productsCollection?.edges?.map((edge: any) => edge.node) ?? []
  }

  async createDatabaseProduct(
    facilityId: string,
    input: CreateProductInput
  ): Promise<ProductResponse> {
    const { data } = await this.client.mutate({
      mutation: CREATE_PRODUCT,
      variables: {
        input: {
          facility_id: facilityId,
          name: input.name,
          description: input.description || null,
          type: input.type,
          price_amount: input.price_amount,
          currency: input.currency,
          stripe_payment_type: input.stripe_payment_type,
          stripe_product_id: input.stripe_product_id,
          stripe_price_id: input.stripe_price_id,
          metadata: JSON.stringify({
            created_at: new Date().toISOString(),
            ...input.metadata,
          }),
          is_active: true,
        },
      },
    })

    const product = data?.insertIntofacility_productsCollection?.records?.[0]
    return {
      product: product || null,
      error: product ? null : 'Failed to create product in database',
    }
  }

  async archiveDatabaseProduct(
    productId: string,
    isActive: boolean
  ): Promise<ArchiveProductResponse> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_PRODUCT,
      variables: {
        id: productId,
        set: {
          is_active: isActive,
          updated_at: new Date().toISOString(),
        },
      },
    })

    const product = data?.updatefacility_productsCollection?.records?.[0]
    return {
      success: !!product,
      error: product ? undefined : 'Failed to update product status',
    }
  }

  async updateDatabaseProduct(
    productId: string,
    input: Partial<FacilityProduct>
  ): Promise<ProductResponse> {
    const { data } = await this.client.mutate({
      mutation: UPDATE_PRODUCT,
      variables: {
        id: productId,
        set: {
          ...input,
          updated_at: new Date().toISOString(),
        },
      },
    })

    const product = data?.updatefacility_productsCollection?.records?.[0]
    return {
      product: product || null,
      error: product ? null : 'Failed to update product in database',
    }
  }

  async createStripeProduct(facilityId: string, input: CreateProductInput): Promise<StripeProduct> {
    const response = await fetch('/api/stripe/prices/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        facility_id: facilityId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create Stripe product')
    }

    return response.json()
  }

  async archiveStripeProduct(
    facilityId: string,
    stripe_product_id: string,
    stripe_price_id: string,
    active: boolean
  ): Promise<void> {
    const response = await fetch('/api/stripe/prices/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stripe_product_id,
        stripe_price_id,
        facility_id: facilityId,
        active,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update Stripe product status')
    }
  }

  async updateStripeProduct(
    facilityId: string,
    stripe_product_id: string,
    stripe_price_id: string,
    input: {
      name?: string
      description?: string
      price_amount?: number
    }
  ): Promise<StripeProduct> {
    const response = await fetch('/api/stripe/prices/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId,
        stripe_product_id,
        stripe_price_id,
        ...input,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update Stripe product')
    }

    return response.json()
  }
}
