import { NextRequest, NextResponse } from 'next/server'
import { sendAdminAlertEmail } from '@/lib/email'
import { getBundlePrice } from '@/lib/bundles'
import { addPendingOrder } from '@/lib/pending-orders'

const GHINSTANTGIGS_BASE_URL = process.env.GHINSTANTGIGS_BASE_URL
const GHINSTANTGIGS_API_KEY = process.env.GHINSTANTGIGS_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { bundleAmount: requestedAmount, bundleId, networkReference, orderReference, recipientPhone, capacityInGb, paystackReference, customerEmail } = await request.json()

    if (!bundleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const catalogPrice = await getBundlePrice(bundleId)
    const bundleAmount = catalogPrice ?? requestedAmount

    if (typeof bundleAmount !== 'number' || bundleAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid bundle amount' },
        { status: 400 }
      )
    }

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
        { error: 'Failed to check balance' },
        { status: 500 }
      )
    }

    const data = await balanceResponse.json()
    const currentBalance = parseFloat(data.data?.walletBalance || '0')

    // Check if sufficient balance
    const hasSufficientBalance = currentBalance >= bundleAmount
    const balanceAfterPurchase = currentBalance - bundleAmount

    if (!hasSufficientBalance) {
      // Save as pending order
      await addPendingOrder({
        networkReference,
        orderReference,
        recipientPhone,
        capacityInGb,
        paystackReference,
        requiredBalance: bundleAmount,
        currentBalance,
        customerEmail,
      })

      // Send alert email to admin
      const emailResult = await sendAdminAlertEmail({
          subject: 'Insufficient Balance - Customer Order Pending',
          html: `
            <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
              <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626; margin-top: 0;">⚠️ Insufficient API Wallet Balance</h2>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  A customer is trying to purchase a bundle but your API wallet doesn't have sufficient funds.
                </p>

                <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #7f1d1d; font-weight: bold;">
                    ❌ Transaction Blocked - Insufficient Balance
                  </p>
                </div>

                <h3 style="color: #333; margin-top: 20px;">Transaction Details:</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                  <tr style="background: #f9fafb;">
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Bundle ID:</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${bundleId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Amount Required:</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">₵${bundleAmount.toFixed(2)}</td>
                  </tr>
                  <tr style="background: #f9fafb;">
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Current Balance:</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">₵${currentBalance.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Shortfall:</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">₵${(bundleAmount - currentBalance).toFixed(2)}</td>
                  </tr>
                </table>

                <h3 style="color: #333; margin-top: 20px;">Required Action:</h3>
                <ol style="color: #666; font-size: 14px; line-height: 1.8;">
                  <li>Log in to your admin dashboard immediately</li>
                  <li>Navigate to the Analytics section</li>
                  <li>Top up your API wallet with ₵${(bundleAmount - currentBalance).toFixed(2)} (or more for buffer)</li>
                  <li>Go to Pending Orders and click "Process" to complete the customer's purchase</li>
                </ol>

                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                  This is an automated alert from TechBro Hub. Please do not reply to this email.
                </p>
              </div>
            </div>
          `,
        })

      if (!emailResult.sent) {
        console.error('Pending order alert email failed:', emailResult.error)
      }
    }

    return NextResponse.json({
      canProceed: hasSufficientBalance,
      currentBalance,
      requiredAmount: bundleAmount,
      balanceAfterPurchase,
      message: hasSufficientBalance
        ? 'Sufficient balance available'
        : `Order is being processed.`,
      savedAsPending: !hasSufficientBalance,
    })
  } catch (error) {
    console.error('Purchase balance check error:', error)
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    )
  }
}
