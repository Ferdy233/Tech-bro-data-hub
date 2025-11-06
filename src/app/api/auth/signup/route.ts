import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'
import { sendEmail, generateVerificationCode, getVerificationEmailHtml, sendAdminNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone: phone || undefined,
      verificationCode,
      verificationCodeExpires
    })

    await user.save()

    // Send admin notification about new user registration
    try {
      await sendAdminNotification('new_user_registration', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      })
    } catch (notificationError) {
      console.error('Error sending admin notification:', notificationError)
      // Don't fail the signup if notification fails
    }

    // Send verification email
    let emailSent = false
    try {
      const emailResult = await sendEmail({
        to: email,
        subject: 'Verify Your Email - Tech Bro Hub',
        html: getVerificationEmailHtml(name, verificationCode)
      })

      if (emailResult.success) {
        emailSent = true
        console.log('Verification email sent successfully')
      } else {
        console.error('Failed to send verification email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }

    return NextResponse.json({
      message: emailSent 
        ? 'User created successfully. Please check your email for verification code.'
        : 'User created successfully. Please check your email for verification code. (Note: Email service may not be configured)',
      user: userData,
      token,
      requiresVerification: true,
      emailSent
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
