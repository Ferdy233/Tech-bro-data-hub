import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const apiKey = process.env.GHINSTANTGIGS_API_KEY
  const baseUrl = process.env.GHINSTANTGIGS_BASE_URL

  if (!apiKey || !baseUrl) {
    return NextResponse.json(
      { success: false, error: 'Server is not configured for order tracking.' },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(req.url)
  const reference = searchParams.get('reference')

  if (!reference || !reference.trim()) {
    return NextResponse.json(
      { success: false, error: 'Please provide an order reference.' },
      { status: 400 },
    )
  }

  try {
    const upstream = await fetch(
      `${baseUrl}/v1/checkOrderStatus/${encodeURIComponent(reference.trim())}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    )

    const contentType = upstream.headers.get('content-type') ?? ''
    const payload = contentType.includes('application/json')
      ? await upstream.json().catch(() => null)
      : await upstream.text().catch(() => null)

    if (!upstream.ok) {
      const message =
        (payload && typeof payload === 'object' && 'message' in payload
          ? String((payload as { message: unknown }).message)
          : null) ?? 'Failed to retrieve order status.'
      return NextResponse.json(
        { success: false, error: message },
        { status: upstream.status },
      )
    }

    return NextResponse.json({
      success: true,
      data: payload,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Could not reach the data provider.' },
      { status: 502 },
    )
  }
}
