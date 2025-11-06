import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const reference = params.reference
    const { email, status, dataXpressRef } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({
        success: false,
        error: 'Status is required'
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
    const orderIndex = user.transactions.findIndex(tx => 
      tx.reference === reference && 
      tx.type === 'debit' && 
      (tx.dataXpressRef || tx.description?.includes('data bundle'))
    )

    if (orderIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }

    // Update order status
    user.transactions[orderIndex].status = status
    user.transactions[orderIndex].updatedAt = new Date()
    
    // Update DataXpress reference if provided
    if (dataXpressRef) {
      user.transactions[orderIndex].dataXpressRef = dataXpressRef
    }

    // Save user
    await user.save()

    console.log(`✅ Order ${reference} status updated to ${status}`)

    return NextResponse.json({
      success: true,
      data: {
        reference,
        status,
        dataXpressRef,
        updatedAt: user.transactions[orderIndex].updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update order status',
      details: error.message
    }, { status: 500 })
  }
}
