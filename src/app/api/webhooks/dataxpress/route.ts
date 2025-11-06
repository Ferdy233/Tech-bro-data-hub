import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-dataxpress-signature')

    console.log('DataXpress webhook received:', { body, signature })

    // Verify webhook signature if configured
    // Note: You should implement proper signature verification based on DataXpress docs
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.DATAXPRESS_WEBHOOK_SECRET!)
    //   .update(body)
    //   .digest('hex')
    
    // if (signature !== expectedSignature) {
    //   console.log('Invalid webhook signature')
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const data = JSON.parse(body)
    console.log('Parsed webhook data:', data)

    // Extract order information from webhook
    const { 
      reference, 
      status, 
      phone, 
      volume, 
      network, 
      message,
      dataXpressRef 
    } = data

    if (!reference && !dataXpressRef) {
      console.log('No reference found in webhook data')
      return NextResponse.json({ error: 'No reference provided' }, { status: 400 })
    }

    await connectDB()

    // Find the order by reference or DataXpress reference
    const user = await User.findOne({
      'transactions.reference': reference || dataXpressRef
    })

    if (!user) {
      console.log(`User not found for reference: ${reference || dataXpressRef}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Find the specific transaction
    const transactionIndex = user.transactions.findIndex(tx => 
      tx.reference === reference || tx.dataXpressRef === dataXpressRef
    )

    if (transactionIndex === -1) {
      console.log(`Transaction not found for reference: ${reference || dataXpressRef}`)
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Update transaction status
    const oldStatus = user.transactions[transactionIndex].status
    let newStatus = oldStatus

    // Map DataXpress status to our status
    if (status === 'success' || status === 'completed') {
      newStatus = 'completed'
    } else if (status === 'failed' || status === 'error') {
      newStatus = 'failed'
    } else if (status === 'pending') {
      newStatus = 'pending'
    }

    // Update the transaction
    user.transactions[transactionIndex].status = newStatus
    user.transactions[transactionIndex].updatedAt = new Date()

    // Update additional fields if provided
    if (dataXpressRef && !user.transactions[transactionIndex].dataXpressRef) {
      user.transactions[transactionIndex].dataXpressRef = dataXpressRef
    }

    if (message) {
      user.transactions[transactionIndex].description = 
        user.transactions[transactionIndex].description + ` - ${message}`
    }

    // Save user
    await user.save()

    console.log(`✅ Updated order ${reference || dataXpressRef} status from ${oldStatus} to ${newStatus}`)

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        reference: reference || dataXpressRef,
        oldStatus,
        newStatus,
        updatedAt: user.transactions[transactionIndex].updatedAt
      }
    })

  } catch (error) {
    console.error('Error processing DataXpress webhook:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process webhook',
      details: error.message
    }, { status: 500 })
  }
}
