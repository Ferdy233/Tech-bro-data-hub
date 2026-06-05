import { NextRequest, NextResponse } from 'next/server'
import { getPendingOrderById, removePendingOrder } from '@/lib/pending-orders'
import type { PendingOrder } from '@/lib/pending-orders'

async function processPurchase(order: PendingOrder) {
  const baseUrl = process.env.GHINSTANTGIGS_BASE_URL
  const apiKey = process.env.GHINSTANTGIGS_API_KEY

  if (!apiKey || !baseUrl) {
    throw new Error('Server is not configured for data purchases.')
  }

  const response = await fetch(`${baseUrl}/v1/purchaseBundle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      networkReference: order.networkReference,
      orderReference: order.orderReference,
      recipientPhone: order.recipientPhone.replace(/\s+/g, ''),
      capacityInGb: order.capacityInGb,
    }),
  })

  if (!response.ok) {
    throw new Error('Purchase failed at data provider')
  }

  return response.json()
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminAuth = request.cookies.get('admin-auth')?.value
  if (adminAuth !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const order = await getPendingOrderById(id)

    if (!order) {
      return NextResponse.json(
        { error: 'Pending order not found' },
        { status: 404 },
      )
    }

    try {
      const result = await processPurchase(order)
      await removePendingOrder(id)

      return NextResponse.json({
        success: true,
        message: 'Order processed successfully',
        orderReference: order.orderReference,
        data: result,
      })
    } catch (purchaseError) {
      return NextResponse.json(
        {
          success: false,
          error: `Purchase failed: ${(purchaseError as Error).message}. Order remains pending.`,
          orderReference: order.orderReference,
        },
        { status: 402 },
      )
    }
  } catch (error) {
    console.error('Error processing pending order:', error)
    return NextResponse.json(
      { error: 'Failed to process pending order' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminAuth = request.cookies.get('admin-auth')?.value
  if (adminAuth !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const removed = await removePendingOrder(id)

    if (!removed) {
      return NextResponse.json(
        { error: 'Pending order not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Pending order deleted',
    })
  } catch (error) {
    console.error('Error deleting pending order:', error)
    return NextResponse.json(
      { error: 'Failed to delete pending order' },
      { status: 500 },
    )
  }
}
