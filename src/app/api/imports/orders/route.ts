import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sendAdminNotification } from '@/lib/email'

// GET - Fetch user's import orders
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: userEmail })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Filter import orders from transactions
    const importOrders = user.transactions.filter(tx => 
      tx.type === 'debit' && 
      (tx.description?.includes('import order') || tx.description?.includes('preorder'))
    )

    const formattedOrders = importOrders.map(order => ({
      id: order.reference,
      reference: order.reference,
      type: order.description?.includes('preorder') ? 'preorder' : 'import',
      items: order.importItems || [],
      totalAmount: order.amount,
      status: order.status,
      description: order.description,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt || order.createdAt,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      deliveryDate: order.deliveryDate,
      notes: order.notes
    }))

    return NextResponse.json({
      success: true,
      data: formattedOrders
    })

  } catch (error) {
    console.error('Error fetching import orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch import orders' },
      { status: 500 }
    )
  }
}

// POST - Create new import order
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      userEmail,
      items,
      shippingAddress,
      notes,
      isPreorder = false
    } = body

    if (!userEmail || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: userEmail })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate total amount
    let totalAmount = 0
    const orderItems = items.map(item => {
      const itemTotal = (item.price + item.shippingCost) * item.quantity
      totalAmount += itemTotal
      return {
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        shippingCost: item.shippingCost,
        quantity: item.quantity,
        total: itemTotal,
        isPreorder: item.isPreorder
      }
    })

    // Check if user has sufficient balance
    if (user.walletBalance < totalAmount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient wallet balance',
          required: totalAmount,
          available: user.walletBalance
        },
        { status: 400 }
      )
    }

    // Generate unique reference
    const reference = `IMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create transaction record
    const transaction = {
      reference,
      amount: totalAmount,
      currency: 'GHS',
      status: 'success' as const,
      type: 'debit' as const,
      description: isPreorder ? 'Import preorder' : 'Import order',
      createdAt: new Date(),
      importItems: orderItems,
      shippingAddress,
      notes,
      trackingNumber: null,
      deliveryDate: null
    }

    // Update user
    user.walletBalance -= totalAmount
    user.transactions.push(transaction)
    await user.save()

    // Send admin notification about new order
    try {
      await sendAdminNotification('new_order', {
        orderId: reference,
        customerName: user.name,
        customerEmail: user.email,
        orderType: isPreorder ? 'Import Preorder' : 'Import Order',
        totalAmount: totalAmount,
        items: orderItems,
        shippingAddress: shippingAddress,
        timestamp: new Date().toISOString()
      })
    } catch (notificationError) {
      console.error('Error sending admin notification:', notificationError)
      // Don't fail the order if notification fails
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: reference,
        totalAmount,
        items: orderItems,
        status: 'confirmed'
      },
      message: isPreorder ? 'Preorder placed successfully' : 'Import order placed successfully'
    })

  } catch (error) {
    console.error('Error creating import order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create import order' },
      { status: 500 }
    )
  }
}
