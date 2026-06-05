import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_NETWORKS = ['mtn', 'telecel', 'atishare', 'atbigtime'] as const
type NetworkRef = (typeof ALLOWED_NETWORKS)[number]

interface PurchaseBody {
  networkReference: NetworkRef
  orderReference: string
  recipientPhone: string
  capacityInGb: number
  paystackReference: string
}

function isValidPhone(phone: string) {
  const cleaned = phone.replace(/\s+/g, '')
  return /^(0[2-9]\d{8}|233[2-9]\d{8})$/.test(cleaned)
}

async function verifyPaystackPayment(reference: string): Promise<{ verified: boolean; error?: string }> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return { verified: false, error: 'Payment service not configured.' }
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    )

    const result = await response.json()

    if (!response.ok || !result.status || result.data?.status !== 'success') {
      return { verified: false, error: result.message || 'Payment not confirmed.' }
    }

    return { verified: true }
  } catch {
    return { verified: false, error: 'Could not verify payment with Paystack.' }
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GHINSTANTGIGS_API_KEY
  const baseUrl = process.env.GHINSTANTGIGS_BASE_URL

  if (!apiKey || !baseUrl) {
    return NextResponse.json(
      { success: false, error: 'Server is not configured for data purchases.' },
      { status: 500 },
    )
  }

  let body: Partial<PurchaseBody>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 },
    )
  }

  const { networkReference, orderReference, recipientPhone, capacityInGb, paystackReference } = body

  // Validate paystackReference
  if (!paystackReference || typeof paystackReference !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing payment reference. Please complete payment first.' },
      { status: 400 },
    )
  }

  if (
    !networkReference ||
    !ALLOWED_NETWORKS.includes(networkReference as NetworkRef)
  ) {
    return NextResponse.json(
      { success: false, error: 'Invalid networkReference.' },
      { status: 400 },
    )
  }
  if (!orderReference || typeof orderReference !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing orderReference.' },
      { status: 400 },
    )
  }
  if (!recipientPhone || !isValidPhone(recipientPhone)) {
    return NextResponse.json(
      { success: false, error: 'Invalid recipient phone number.' },
      { status: 400 },
    )
  }
  if (typeof capacityInGb !== 'number' || capacityInGb <= 0) {
    return NextResponse.json(
      { success: false, error: 'Invalid capacityInGb.' },
      { status: 400 },
    )
  }

  // Step 1: Verify payment with Paystack
  const { verified, error: paymentError } = await verifyPaystackPayment(paystackReference)
  if (!verified) {
    return NextResponse.json(
      { success: false, error: paymentError || 'Payment verification failed. Data will not be processed.' },
      { status: 402 },
    )
  }

  // Step 1.5: Check API wallet balance before processing
  try {
    const balanceCheckResponse = await fetch(`${req.nextUrl.origin}/api/check-purchase-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bundleId: orderReference,
        bundleAmount: capacityInGb * 10,
        networkReference,
        orderReference,
        recipientPhone,
        capacityInGb,
        paystackReference,
        customerEmail: '',
      }),
    })

    const balanceData = await balanceCheckResponse.json()

    if (!balanceData.canProceed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order is being processed.',
          paymentVerified: true,
          orderId: orderReference,
        },
        { status: 402 },
      )
    }
  } catch (error) {
    console.error('Balance check failed:', error)
    // Don't block the transaction if balance check fails - just log it
  }

  // Step 2: Payment confirmed — now deliver the data bundle
  try {
    const upstream = await fetch(`${baseUrl}/v1/purchaseBundle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        networkReference,
        orderReference,
        recipientPhone: recipientPhone.replace(/\s+/g, ''),
        capacityInGb,
      }),
    })

    const contentType = upstream.headers.get('content-type') ?? ''
    const payload = contentType.includes('application/json')
      ? await upstream.json().catch(() => null)
      : await upstream.text().catch(() => null)

    if (!upstream.ok) {
      const message =
        (payload && typeof payload === 'object' && 'message' in payload
          ? String((payload as { message: unknown }).message)
          : null) ?? 'Data delivery failed after payment. Please contact support.'
      return NextResponse.json(
        { success: false, error: message },
        { status: upstream.status },
      )
    }

    return NextResponse.json({
      success: true,
      orderReference,
      data: payload,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Could not reach the data provider. Payment was successful — please contact support.' },
      { status: 502 },
    )
  }
}
