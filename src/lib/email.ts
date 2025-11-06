import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration missing. Email not sent.')
      return { success: false, error: 'Email configuration not set' }
    }

    const mailOptions = {
      from: `"Tech Bro Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendAdminNotification(type: string, details: any) {
  try {
    // Get admin email from environment or use default
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    if (!adminEmail) {
      console.warn('Admin email not configured. Notification not sent.')
      return { success: false, error: 'Admin email not configured' }
    }

    const html = getAdminNotificationEmailHtml(type, details)
    const subject = type === 'new_ad_inquiry' ? 'New Advertising Inquiry - Tech Bro Hub' :
                   type === 'new_order' ? 'New Order - Tech Bro Hub' :
                   type === 'new_user_registration' ? 'New User Registration - Tech Bro Hub' :
                   'System Notification - Tech Bro Hub'

    const result = await sendEmail({
      to: adminEmail,
      subject,
      html
    })

    console.log(`Admin notification sent: ${type}`)
    return result
  } catch (error) {
    console.error('Error sending admin notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateResetToken(): string {
  const crypto = require('node:crypto')
  return crypto.randomBytes(32).toString('hex')
}

export function getVerificationEmailHtml(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - Tech Bro Hub</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code { background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Tech Bro Hub!</h1>
          <p>Verify your email address to get started</p>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for signing up with Tech Bro Hub. To complete your registration and start using our platform, please verify your email address using the code below:</p>
          
          <div class="code">${code}</div>
          
          <p>This verification code will expire in 10 minutes for security reasons.</p>
          
          <p>If you didn't create an account with Tech Bro Hub, please ignore this email.</p>
          
          <p>Best regards,<br>The Tech Bro Hub Team</p>
        </div>
        <div class="footer">
          <p>© 2024 Tech Bro Hub. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getAdminNotificationEmailHtml(type: string, details: any): string {
  const formatDate = (date: string) => new Date(date).toLocaleString()
  
  let content = ''
  let subject = ''
  
  switch (type) {
    case 'new_ad_inquiry':
      content = `
        <h3>New Advertising Inquiry</h3>
        <p><strong>Business Name:</strong> ${details.businessName || 'Not provided'}</p>
        <p><strong>Contact Name:</strong> ${details.contactName || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${details.phone || 'Not provided'}</p>
        <p><strong>Business Type:</strong> ${details.businessType || 'Not provided'}</p>
        <p><strong>Budget:</strong> ${details.budget || 'Not provided'}</p>
        <p><strong>Description:</strong> ${details.description || 'No description provided'}</p>
        <p><strong>Timestamp:</strong> ${formatDate(new Date().toISOString())}</p>
      `
      subject = 'New Advertising Inquiry - Tech Bro Hub'
      break
      
    case 'new_order':
      content = `
        <h3>New Order Received</h3>
        <p><strong>Order ID:</strong> ${details.orderId}</p>
        <p><strong>Customer:</strong> ${details.customerName} (${details.customerEmail})</p>
        <p><strong>Order Type:</strong> ${details.orderType}</p>
        <p><strong>Total Amount:</strong> GH₵${details.totalAmount}</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${details.items.map((item: any) => `<li>${item.name} x${item.quantity} - GH₵${item.total}</li>`).join('')}
        </ul>
        <p><strong>Shipping Address:</strong> ${details.shippingAddress ? `${details.shippingAddress.name}, ${details.shippingAddress.address}` : 'N/A'}</p>
        <p><strong>Timestamp:</strong> ${formatDate(details.timestamp)}</p>
      `
      subject = 'New Order - Tech Bro Hub'
      break
      
    case 'new_user_registration':
      content = `
        <h3>New User Registration</h3>
        <p><strong>Name:</strong> ${details.name}</p>
        <p><strong>Email:</strong> ${details.email}</p>
        <p><strong>Phone:</strong> ${details.phone || 'Not provided'}</p>
        <p><strong>Registration Date:</strong> ${formatDate(details.createdAt)}</p>
      `
      subject = 'New User Registration - Tech Bro Hub'
      break
      
    default:
      content = `<h3>System Notification</h3><p>${details.message || 'No details provided'}</p>`
      subject = 'System Notification - Tech Bro Hub'
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        ul { margin: 10px 0; padding-left: 20px; }
        li { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Admin Notification</h1>
          <p>Tech Bro Hub - ${subject}</p>
        </div>
        <div class="content">
          ${content}
          
          <div class="alert">
            <strong>Action Required:</strong> Please review this notification and take appropriate action if needed.
          </div>
          
          <p>Best regards,<br>Tech Bro Hub System</p>
        </div>
        <div class="footer">
          <p>© 2024 Tech Bro Hub. All rights reserved.</p>
          <p>This is an automated notification email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getPasswordResetEmailHtml(name: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Tech Bro Hub</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
          <p>Reset your Tech Bro Hub password</p>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>We received a request to reset your password for your Tech Bro Hub account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <a href="${resetLink}" class="button">Reset Password</a>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <p>Best regards,<br>The Tech Bro Hub Team</p>
        </div>
        <div class="footer">
          <p>© 2024 Tech Bro Hub. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
