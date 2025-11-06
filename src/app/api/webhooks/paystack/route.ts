import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    console.log('Paystack webhook received:', event.event)

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data)
        break
      case 'charge.failed':
        await handleFailedPayment(event.data)
        break
      case 'transfer.success':
        await handleSuccessfulTransfer(event.data)
        break
      case 'transfer.failed':
        await handleFailedTransfer(event.data)
        break
      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    await connectDB()

    const userId = data.metadata?.userId
    if (!userId) {
      console.error('No userId in payment metadata')
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      console.error('User not found for successful payment:', userId)
      return
    }

    // Update wallet balance
    const amount = data.amount / 100 // Convert from pesewas
    user.walletBalance = (user.walletBalance || 0) + amount

    // Add transaction record
    const transactionRecord = {
      reference: data.reference,
      amount: amount,
      currency: data.currency,
      status: 'success',
      type: 'credit',
      description: 'Wallet top-up via Paystack',
      createdAt: new Date(),
      paystackData: {
        id: data.id,
        gateway_response: data.gateway_response,
        channel: data.channel,
        ip_address: data.ip_address
      }
    }

    if (!user.transactions) {
      user.transactions = []
    }
    user.transactions.push(transactionRecord)

    await user.save()

    console.log(`Successfully processed payment for user ${userId}: ${amount} ${data.currency}`)

  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handleFailedPayment(data: any) {
  try {
    await connectDB()

    const userId = data.metadata?.userId
    if (!userId) {
      console.error('No userId in failed payment metadata')
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      console.error('User not found for failed payment:', userId)
      return
    }

    // Add failed transaction record
    const transactionRecord = {
      reference: data.reference,
      amount: data.amount / 100,
      currency: data.currency,
      status: 'failed',
      type: 'credit',
      description: 'Failed wallet top-up via Paystack',
      createdAt: new Date(),
      paystackData: {
        id: data.id,
        gateway_response: data.gateway_response,
        channel: data.channel,
        failure_reason: data.gateway_response
      }
    }

    if (!user.transactions) {
      user.transactions = []
    }
    user.transactions.push(transactionRecord)

    await user.save()

    console.log(`Failed payment recorded for user ${userId}: ${data.reference}`)

  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

async function handleSuccessfulTransfer(data: any) {
  try {
    console.log('Successful transfer:', data.reference)
    // Handle successful transfers (e.g., withdrawals to bank accounts)
    // Implementation depends on your specific use case
  } catch (error) {
    console.error('Error handling successful transfer:', error)
  }
}

async function handleFailedTransfer(data: any) {
  try {
    console.log('Failed transfer:', data.reference)
    // Handle failed transfers
    // Implementation depends on your specific use case
  } catch (error) {
    console.error('Error handling failed transfer:', error)
  }
}
