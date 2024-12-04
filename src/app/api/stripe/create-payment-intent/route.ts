import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { createAdminClient } from '@/lib/supabase/server'

interface RequestBody {
  companyId: string
  courtNumber: number
  startTime: string
  guestInfo: {
    name: string
    email: string
    phone: string
    net_height: string
  }
  selectedProducts: {
    courtProductId: string
    equipmentProductIds: string[]
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody
    console.log(' Received payment intent request:', {
      companyId: body.companyId,
      courtNumber: body.courtNumber,
      startTime: body.startTime,
      products: {
        court: body.selectedProducts.courtProductId,
        equipment: body.selectedProducts.equipmentProductIds,
      },
    })

    // Get company and verify Stripe setup
    const supabase = createAdminClient()
    console.log('🔍 Fetching company details...')
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('stripe_account_id, stripe_currency')
      .eq('id', body.companyId)
      .single()

    if (companyError) {
      console.error('❌ Error fetching company:', companyError)
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    if (!company?.stripe_account_id) {
      console.error('❌ Company has no Stripe account:', body.companyId)
      return NextResponse.json({ error: 'Company is not setup for payments' }, { status: 400 })
    }

    // Get selected products with prices
    console.log('🔍 Fetching product details...')
    const { data: products, error: productsError } = await supabase
      .from('company_products')
      .select('id, price_amount, name, type')
      .in('id', [
        body.selectedProducts.courtProductId,
        ...body.selectedProducts.equipmentProductIds,
      ])

    if (productsError) {
      console.error('❌ Error fetching products:', productsError)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    if (!products?.length) {
      console.error('❌ No products found for IDs:', {
        court: body.selectedProducts.courtProductId,
        equipment: body.selectedProducts.equipmentProductIds,
      })
      return NextResponse.json({ error: 'Products not found' }, { status: 400 })
    }

    // Calculate total amount
    const amount = products.reduce((sum, product) => sum + product.price_amount, 0)
    console.log('💰 Calculated total amount:', {
      amount,
      currency: company.stripe_currency,
      products: products.map((p) => ({ id: p.id, name: p.name, price: p.price_amount })),
    })

    // Create payment intent
    console.log('💳 Creating Stripe payment intent...')
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: company.stripe_currency?.toLowerCase() ?? 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          companyId: body.companyId,
          courtNumber: body.courtNumber,
          startTime: body.startTime,
          customerEmail: body.guestInfo.email,
          customerName: body.guestInfo.name,
          customerPhone: body.guestInfo.phone,
          netHeight: body.guestInfo.net_height,
          courtProductId: body.selectedProducts.courtProductId,
          equipmentProductIds: JSON.stringify(body.selectedProducts.equipmentProductIds),
        },
      },
      {
        stripeAccount: company.stripe_account_id,
      }
    )

    console.log('✅ Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('❌ [stripe/create-payment-intent] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
