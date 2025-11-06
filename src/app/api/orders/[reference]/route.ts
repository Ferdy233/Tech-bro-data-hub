import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

const DATAXPRESS_API_KEY = process.env.DATAXPRESS_API_KEY
const DATAXPRESS_BASE_URL = process.env.DATAXPRESS_BASE_URL || 'https://www.dataxpress.shop'

export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const reference = params.reference

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

    // Find the specific order
    const order = user.transactions.find(tx => 
      tx.reference === reference && 
      tx.type === 'debit' && 
      (tx.dataXpressRef || tx.description?.includes('data bundle'))
    )

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }

    // Try to get updated status from DataXpress if we have a reference
    let dataXpressStatus = null
    if (order.dataXpressRef && DATAXPRESS_API_KEY) {
      try {
        const response = await fetch(`${DATAXPRESS_BASE_URL}/api/order-status/${order.dataXpressRef}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': DATAXPRESS_API_KEY
          }
        })

        if (response.ok) {
          const data = await response.json()
          dataXpressStatus = data
          console.log(`✅ DataXpress status for ${order.dataXpressRef}:`, data)
        } else {
          console.log(`❌ DataXpress status check failed for ${order.dataXpressRef}: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ DataXpress status check error for ${order.dataXpressRef}:`, error.message)
      }
    }

    // Format order details
    const orderDetails = {
      id: order.reference,
      reference: order.reference,
      dataXpressRef: order.dataXpressRef,
      phone: order.phone,
      volume: order.volume,
      network: order.network,
      amount: order.amount,
      status: order.status,
      description: order.description,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt || order.createdAt,
      paystackData: order.paystackData,
      dataXpressStatus: dataXpressStatus
    }

    return NextResponse.json({
      success: true,
      data: orderDetails
    })

  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch order details',
      details: error.message
    }, { status: 500 })
  }
}
