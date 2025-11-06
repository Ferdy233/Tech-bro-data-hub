import { NextRequest, NextResponse } from 'next/server'
import { promoteUserToAdmin, demoteAdminToUser, isUserAdmin, getAllAdmins } from '@/lib/admin'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET - Get all admin users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestingUserEmail = searchParams.get('email')

    if (!requestingUserEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      )
    }

    // Check if requesting user is admin
    const isAdmin = await isUserAdmin(requestingUserEmail)
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const admins = await getAllAdmins()
    
    return NextResponse.json({
      success: true,
      data: admins
    })

  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin users' },
      { status: 500 }
    )
  }
}

// POST - Promote user to admin or demote admin to user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, targetEmail, requestingUserEmail } = body

    if (!action || !targetEmail || !requestingUserEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if requesting user is admin
    const isAdmin = await isUserAdmin(requestingUserEmail)
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Prevent self-demotion
    if (action === 'demote' && targetEmail === requestingUserEmail) {
      return NextResponse.json(
        { success: false, error: 'Cannot demote yourself' },
        { status: 400 }
      )
    }

    let success = false
    let message = ''

    if (action === 'promote') {
      success = await promoteUserToAdmin(targetEmail)
      message = success ? 'User promoted to admin successfully' : 'Failed to promote user to admin'
    } else if (action === 'demote') {
      success = await demoteAdminToUser(targetEmail)
      message = success ? 'Admin demoted to user successfully' : 'Failed to demote admin to user'
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "promote" or "demote"' },
        { status: 400 }
      )
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message,
        data: { action, targetEmail }
      })
    } else {
      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error managing admin roles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to manage admin roles' },
      { status: 500 }
    )
  }
}

