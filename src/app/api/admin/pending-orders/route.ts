import { NextRequest, NextResponse } from 'next/server'
import { addPendingOrder, getPendingOrders } from '@/lib/pending-orders'

export async function GET(request: NextRequest) {
  const adminAuth = request.cookies.get('admin-auth')?.value
  if (adminAuth !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orders = await getPendingOrders()
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error reading pending orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending orders' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      networkReference,
      orderReference,
      recipientPhone,
      capacityInGb,
      paystackReference,
      requiredBalance,
      currentBalance,
      customerEmail,
    } = body

    const newOrder = await addPendingOrder({
      networkReference,
      orderReference,
      recipientPhone,
      capacityInGb,
      paystackReference,
      requiredBalance,
      currentBalance,
      customerEmail,
    })

    return NextResponse.json({
      success: true,
      order: newOrder,
    })
  } catch (error) {
    console.error('Error saving pending order:', error)
    return NextResponse.json(
      { error: 'Failed to save pending order' },
      { status: 500 },
    )
  }
}
