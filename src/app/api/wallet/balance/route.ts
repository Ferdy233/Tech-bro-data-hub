import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    // Get user email from query parameters
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
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

    console.log('Wallet balance API - User:', user.email, 'Balance:', user.walletBalance, 'Transactions:', user.transactions?.length || 0)
    
    // Log recent transactions for debugging
    if (user.transactions && user.transactions.length > 0) {
      console.log('Recent transactions:', user.transactions.slice(-3).map(t => ({
        reference: t.reference,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt
      })))
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: user.walletBalance || 0,
        currency: 'GHS',
        transactions: user.transactions || []
      }
    })

  } catch (error) {
    console.error('Wallet balance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}