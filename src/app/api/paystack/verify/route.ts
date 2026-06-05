import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference')

  if (!reference) {
    return NextResponse.json(
      { success: false, error: 'Missing payment reference.' },
      { status: 400 },
    )
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { success: false, error: 'Payment service not configured.' },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    )

    const result = await response.json()

    if (!response.ok || !result.status) {
      return NextResponse.json(
        { success: false, error: result.message || 'Payment verification failed.' },
        { status: 400 },
      )
    }

    const { data } = result

    if (data.status !== 'success') {
      return NextResponse.json(
        { success: false, error: `Payment not successful. Status: ${data.status}` },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        reference: data.reference,
        amount: data.amount / 100,
        currency: data.currency,
        status: data.status,
        metadata: data.metadata,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Could not verify payment.' },
      { status: 502 },
    )
  }
}
