import { NextRequest, NextResponse } from 'next/server'
import Paystack from 'paystack'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()
    console.log('Payment verification request for reference:', reference)

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    console.log('Calling Paystack to verify payment...')
    const response = await paystack.transaction.verify(reference)
    console.log('Paystack verification response:', response.status, response.data?.status)

    if (!response.status) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    const transaction = response.data

    // Check if payment was successful
    if (transaction.status !== 'success') {
      return NextResponse.json({
        success: false,
        data: {
          status: transaction.status,
          message: 'Payment not successful'
        }
      })
    }

    await connectDB()

    // Get user from metadata
    const userId = transaction.metadata?.userId
    if (!userId) {
      return NextResponse.json(
        { error: 'User information not found in transaction' },
        { status: 400 }
      )
    }

    // Update user's wallet balance
    const user = await User.findById(userId)
    if (!user) {
      console.log('User not found for ID:', userId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('User found:', user.email, 'Current balance:', user.walletBalance)

    // Check if transaction already exists to prevent duplicates
    const existingTransaction = user.transactions?.find(t => t.reference === transaction.reference)
    if (existingTransaction) {
      console.log('Transaction already exists, returning existing data')
        return NextResponse.json({
          success: true,
          data: {
            status: 'success',
            amount: existingTransaction.amount,
            currency: existingTransaction.currency,
            reference: existingTransaction.reference,
            newBalance: user.walletBalance,
            userEmail: user.email,
            message: 'Payment already processed'
          }
        })
    }

    // Add amount to user's wallet (convert from pesewas back to GHS)
    const amount = transaction.amount / 100
    const oldBalance = user.walletBalance || 0
    user.walletBalance = oldBalance + amount
    
    console.log(`Updating wallet: ${oldBalance} + ${amount} = ${user.walletBalance}`)

    // Add transaction record
    const transactionRecord = {
      reference: transaction.reference,
      amount: amount,
      currency: transaction.currency,
      status: 'success',
      type: 'credit',
      description: 'Wallet top-up via Paystack',
      createdAt: new Date(),
      paystackData: {
        id: transaction.id,
        gateway_response: transaction.gateway_response,
        channel: transaction.channel,
        ip_address: transaction.ip_address
      }
    }

    if (!user.transactions) {
      user.transactions = []
    }
    user.transactions.push(transactionRecord)

    console.log('Saving user with new transaction:', transactionRecord)
    console.log('Before save - User balance:', user.walletBalance, 'Transactions count:', user.transactions?.length || 0)
    
    const savedUser = await user.save()
    console.log('User saved successfully. New balance:', savedUser.walletBalance)
    console.log('After save - Transactions count:', savedUser.transactions?.length || 0)
    
    // Verify the save worked by fetching the user again
    const verifyUser = await User.findById(userId)
    console.log('Verification fetch - Balance:', verifyUser?.walletBalance, 'Transactions:', verifyUser?.transactions?.length || 0)

    return NextResponse.json({
      success: true,
      data: {
        status: 'success',
        amount: amount,
        currency: transaction.currency,
        reference: transaction.reference,
        newBalance: user.walletBalance,
        userEmail: user.email,
        message: 'Payment verified and wallet updated successfully'
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const response = await paystack.transaction.verify(reference)

    if (!response.status) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: response.data
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
