import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Clear wallet balance and transactions
    user.walletBalance = 0
    user.transactions = []

    await user.save()

    console.log('Cleared wallet data for user:', user.email)

    return NextResponse.json({
      success: true,
      message: 'Wallet cleared successfully',
      data: {
        balance: 0,
        transactions: []
      }
    })

  } catch (error) {
    console.error('Clear wallet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
