import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const GHINSTANTGIGS_BASE_URL = process.env.GHINSTANTGIGS_BASE_URL
const GHINSTANTGIGS_API_KEY = process.env.GHINSTANTGIGS_API_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const ALERT_EMAIL = process.env.ALERT_EMAIL_RECIPIENT
const LOW_BALANCE_THRESHOLD = parseFloat(process.env.LOW_BALANCE_THRESHOLD || '500')

export async function GET(request: NextRequest) {
  try {
    // Fetch current balance from GhInstantGigs
    const balanceResponse = await fetch(
      `${GHINSTANTGIGS_BASE_URL}/v1/checkWalletBalance`,
      {
        headers: {
          Authorization: `Bearer ${GHINSTANTGIGS_API_KEY}`,
        },
      }
    )

    if (!balanceResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch balance' },
        { status: 500 }
      )
    }

    const data = await balanceResponse.json()
    const currentBalance = parseFloat(data.data?.walletBalance || '0')

    // Check if balance is low
    const isLow = currentBalance < LOW_BALANCE_THRESHOLD

    if (isLow && RESEND_API_KEY && ALERT_EMAIL) {
      // Send alert email
      const resend = new Resend(RESEND_API_KEY)

      await resend.emails.send({
        from: 'noreply@techbro.com',
        to: ALERT_EMAIL,
        subject: '⚠️ Low API Wallet Balance Alert',
        html: `
          <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d97706; margin-top: 0;">Low Wallet Balance Alert</h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Your API wallet balance has dropped below the alert threshold.
              </p>

              <div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-weight: bold;">
                  Current Balance: ₵${currentBalance.toFixed(2)}
                </p>
                <p style="margin: 5px 0 0 0; color: #92400e;">
                  Alert Threshold: ₵${LOW_BALANCE_THRESHOLD.toFixed(2)}
                </p>
              </div>

              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                <strong>What you need to do:</strong><br/>
                1. Log in to your admin dashboard<br/>
                2. Go to Analytics section<br/>
                3. Top up your API wallet from your Paystack balance<br/>
                4. Ensure sufficient funds are available for customer orders
              </p>

              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                This is an automated alert from TechBro Hub. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
      })
    }

    return NextResponse.json({
      balance: currentBalance,
      isLow,
      threshold: LOW_BALANCE_THRESHOLD,
      alertSent: isLow && !!RESEND_API_KEY && !!ALERT_EMAIL,
    })
  } catch (error) {
    console.error('Balance check error:', error)
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    )
  }
}
