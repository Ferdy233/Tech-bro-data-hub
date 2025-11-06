import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET - Fetch all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const requestingUserEmail = searchParams.get('email')

    if (!requestingUserEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      )
    }

    // Check if requesting user is admin
    const requestingUser = await User.findOne({ email: requestingUserEmail })
    if (!requestingUser || requestingUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Fetch all users with basic info (exclude passwords)
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })

    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      walletBalance: user.walletBalance || 0,
      createdAt: user.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

