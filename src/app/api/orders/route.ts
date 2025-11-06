import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const network = searchParams.get('network')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 })
    }

    await connectDB()

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // Get all relevant transactions (data purchases and import orders)
    let orders = user.transactions.filter(tx => 
      tx.type === 'debit' && 
      (tx.dataXpressRef || tx.description?.includes('data bundle') || tx.description?.includes('import'))
    )

    // Apply filters
    if (status) {
      orders = orders.filter(order => order.status === status)
    }
    if (network) {
      orders = orders.filter(order => 
        order.network?.toLowerCase() === network.toLowerCase() ||
        order.description?.toLowerCase().includes(network.toLowerCase())
      )
    }
    if (type) {
      if (type === 'data') {
        orders = orders.filter(order => 
          order.dataXpressRef || order.description?.includes('data bundle')
        )
      } else if (type === 'import') {
        orders = orders.filter(order => 
          order.description?.includes('import') && !order.dataXpressRef
        )
      }
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOrders = orders.slice(startIndex, endIndex)

    // Format orders for response
    const formattedOrders = paginatedOrders.map(order => ({
      id: order.reference,
      reference: order.reference,
      type: order.dataXpressRef || order.description?.includes('data bundle') ? 'data' : 'import',
      dataXpressRef: order.dataXpressRef,
      phone: order.phone,
      volume: order.volume,
      network: order.network,
      amount: order.amount,
      status: order.status,
      description: order.description,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt || order.createdAt,
      // Import order fields
      importType: order.description?.includes('import') ? order.description.split(' ')[0] : undefined,
      quantity: order.description?.includes('import') ? 1 : undefined, // Default quantity
      destination: order.description?.includes('import') ? 'Ghana' : undefined, // Default destination
      trackingNumber: order.dataXpressRef || undefined
    }))

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(orders.length / limit),
          totalOrders: orders.length,
          limit: limit
        },
        filters: {
          status,
          network,
          type
        }
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders',
      details: error.message
    }, { status: 500 })
  }
}
