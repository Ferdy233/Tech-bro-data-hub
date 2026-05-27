import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_NETWORKS = ['mtn', 'telecel', 'atishare', 'atbigtime'] as const
type NetworkRef = (typeof ALLOWED_NETWORKS)[number]

interface PurchaseBody {
  networkReference: NetworkRef
  orderReference: string
  recipientPhone: string
  capacityInGb: number
}

function isValidPhone(phone: string) {
  const cleaned = phone.replace(/\s+/g, '')
  return /^(0[2-9]\d{8}|233[2-9]\d{8})$/.test(cleaned)
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

  const { networkReference, orderReference, recipientPhone, capacityInGb } = body

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
          : null) ?? 'Upstream purchase failed.'
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
      { success: false, error: 'Could not reach the data provider.' },
      { status: 502 },
    )
  }
}
