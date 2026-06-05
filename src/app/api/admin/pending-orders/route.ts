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

export async function GET(request: NextRequest) {
  // Check admin authentication
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
      { status: 500 }
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

    const orders = await getPendingOrders()

    const newOrder: PendingOrder = {
      id: `pending-${Date.now()}`,
      networkReference,
      orderReference,
      recipientPhone,
      capacityInGb,
      paystackReference,
      requiredBalance,
      currentBalance,
      createdAt: new Date().toISOString(),
      customerEmail,
    }

    orders.push(newOrder)
    await savePendingOrders(orders)

    return NextResponse.json({
      success: true,
      order: newOrder,
    })
  } catch (error) {
    console.error('Error saving pending order:', error)
    return NextResponse.json(
      { error: 'Failed to save pending order' },
      { status: 500 }
    )
  }
}
