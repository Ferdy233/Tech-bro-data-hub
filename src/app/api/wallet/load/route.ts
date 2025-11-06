import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const { amount, userId, description, adminEmail } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user is admin
    const adminUser = await User.findOne({ email: adminEmail })
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Find target user
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    // Update wallet balance
    targetUser.walletBalance = (targetUser.walletBalance || 0) + amount

    // Add transaction record
    const transactionRecord = {
      reference: `ADMIN_LOAD_${Date.now()}`,
      amount: amount,
      currency: 'GHS',
      status: 'success',
      type: 'credit',
      description: description || 'Admin wallet load',
      createdAt: new Date(),
      adminData: {
        loadedBy: adminUser._id.toString(),
        loadedByEmail: adminUser.email
      }
    }

    if (!targetUser.transactions) {
      targetUser.transactions = []
    }
    targetUser.transactions.push(transactionRecord)

    await targetUser.save()

    return NextResponse.json({
      success: true,
      data: {
        newBalance: targetUser.walletBalance,
        amount: amount,
        message: 'Wallet loaded successfully'
      }
    })

  } catch (error) {
    console.error('Wallet load error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
