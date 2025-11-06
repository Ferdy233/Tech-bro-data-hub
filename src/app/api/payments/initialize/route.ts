import { NextRequest, NextResponse } from 'next/server'
import Paystack from 'paystack'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { amount, email, reference, currency = 'GHS', metadata = {} } = await request.json()

    // Validate required fields
    if (!amount || !email || !reference) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, email, reference' },
        { status: 400 }
      )
    }

    // Validate amount (minimum 1 GHS)
    if (amount < 1) {
      return NextResponse.json(
        { error: 'Minimum amount is 1 GHS' },
        { status: 400 }
      )
    }

    await connectDB()

    // Verify user exists
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Initialize payment with Paystack
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`
    console.log('Payment initialization - callback URL:', callbackUrl)
    
    const response = await paystack.transaction.initialize({
      amount: amount * 100, // Convert to pesewas
      email,
      reference,
      currency,
      metadata: {
        userId: user._id.toString(),
        ...metadata
      },
      callback_url: callbackUrl,
      channels: ['card', 'mobile_money', 'bank_transfer']
    })

    if (response.status) {
      return NextResponse.json({
        success: true,
        data: {
          authorization_url: response.data.authorization_url,
          access_code: response.data.access_code,
          reference: response.data.reference
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
