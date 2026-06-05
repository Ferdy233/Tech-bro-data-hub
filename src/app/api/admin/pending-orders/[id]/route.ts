import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const PENDING_ORDERS_FILE = join(process.cwd(), 'data', 'pending-orders.json')

interface PendingOrder {
  id: string
  networkReference: string
  orderReference: string
  recipientPhone: string
  capacityInGb: number
  paystackReference: string
  requiredBalance: number
  currentBalance: number
  createdAt: string
  customerEmail?: string
}

async function getPendingOrders(): Promise<PendingOrder[]> {
  try {
    const data = await readFile(PENDING_ORDERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function savePendingOrders(orders: PendingOrder[]): Promise<void> {
  await writeFile(PENDING_ORDERS_FILE, JSON.stringify(orders, null, 2))
}

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
  { params }: { params: { id: string } }
) {
  // Check admin authentication
  const adminAuth = request.cookies.get('admin-auth')?.value
  if (adminAuth !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = params
    const orders = await getPendingOrders()
    const orderIndex = orders.findIndex((o) => o.id === id)

    if (orderIndex === -1) {
      return NextResponse.json(
        { error: 'Pending order not found' },
        { status: 404 }
      )
    }

    const order = orders[orderIndex]

    // Try to process the purchase
    try {
      const result = await processPurchase(order)

      // If successful, remove from pending orders
      orders.splice(orderIndex, 1)
      await savePendingOrders(orders)

      return NextResponse.json({
        success: true,
        message: 'Order processed successfully',
        orderReference: order.orderReference,
        data: result,
      })
    } catch (purchaseError) {
      // If purchase fails again, return error but keep order in pending
      return NextResponse.json(
        {
          success: false,
          error: `Purchase failed: ${(purchaseError as Error).message}. Order remains pending.`,
          orderReference: order.orderReference,
        },
        { status: 402 }
      )
    }
  } catch (error) {
    console.error('Error processing pending order:', error)
    return NextResponse.json(
      { error: 'Failed to process pending order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin authentication
  const adminAuth = request.cookies.get('admin-auth')?.value
  if (adminAuth !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = params
    const orders = await getPendingOrders()
    const filteredOrders = orders.filter((o) => o.id !== id)

    if (filteredOrders.length === orders.length) {
      return NextResponse.json(
        { error: 'Pending order not found' },
        { status: 404 }
      )
    }

    await savePendingOrders(filteredOrders)

    return NextResponse.json({
      success: true,
      message: 'Pending order deleted',
    })
  } catch (error) {
    console.error('Error deleting pending order:', error)
    return NextResponse.json(
      { error: 'Failed to delete pending order' },
      { status: 500 }
    )
  }
}
