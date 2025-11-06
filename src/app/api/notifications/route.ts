import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET - Fetch admin notifications
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const adminEmail = searchParams.get('email')

    if (!adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Admin email is required' },
        { status: 400 }
      )
    }

    // Check if user is admin
    const admin = await User.findOne({ email: adminEmail, role: 'admin' })
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Get all recent import orders and preorders
    const recentOrders = await User.aggregate([
      {
        $unwind: '$transactions'
      },
      {
        $match: {
          'transactions.type': 'debit',
          'transactions.description': { $in: ['Import order', 'Import preorder'] },
          'transactions.createdAt': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }
      },
      {
        $project: {
          _id: 0,
          customerName: '$name',
          customerEmail: '$email',
          orderReference: '$transactions.reference',
          orderType: '$transactions.description',
          orderAmount: '$transactions.amount',
          orderStatus: '$transactions.status',
          orderDate: '$transactions.createdAt',
          items: '$transactions.importItems',
          shippingAddress: '$transactions.shippingAddress'
        }
      },
      {
        $sort: { orderDate: -1 }
      }
    ])

    const notifications = recentOrders.map(order => ({
      id: order.orderReference,
      type: order.orderType === 'Import preorder' ? 'preorder' : 'order',
      title: `${order.orderType} from ${order.customerName}`,
      message: `New ${order.orderType.toLowerCase()} worth ${order.orderAmount} GHS`,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      amount: order.orderAmount,
      status: order.orderStatus,
      createdAt: order.orderDate,
      items: order.items,
      shippingAddress: order.shippingAddress
    }))

    return NextResponse.json({
      success: true,
      data: notifications
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST - Create notification (for future use)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      type,
      title,
      message,
      customerEmail,
      customerName,
      amount,
      items,
      shippingAddress
    } = body

    // This could be used to create custom notifications
    // For now, notifications are generated from orders automatically

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully'
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

