import { NextRequest, NextResponse } from 'next/server'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

const DATAXPRESS_API_KEY = process.env.DATAXPRESS_API_KEY
const DATAXPRESS_BASE_URL = process.env.DATAXPRESS_BASE_URL || 'https://www.dataxpress.shop'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 })
    }

    if (!DATAXPRESS_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'DataXpress API key not configured'
      }, { status: 500 })
    }

    await connectDB()

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // Get all pending orders with DataXpress references
    const pendingOrders = user.transactions.filter(tx => 
      tx.type === 'debit' && 
      tx.dataXpressRef && 
      (tx.status === 'pending' || tx.status === 'success')
    )

    console.log(`Found ${pendingOrders.length} orders to sync for user ${email}`)

    const syncResults = {
      total: pendingOrders.length,
      updated: 0,
      errors: 0,
      details: [] as any[]
    }

    // Sync each order
    for (const order of pendingOrders) {
      try {
        console.log(`Syncing order ${order.reference} (${order.dataXpressRef})`)
        
        const response = await fetch(`${DATAXPRESS_BASE_URL}/api/order-status/${order.dataXpressRef}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': DATAXPRESS_API_KEY
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ DataXpress status for ${order.dataXpressRef}:`, data)
          
          // Map DataXpress status to our status
          let newStatus = order.status
          if (data.status === 'success' || data.status === 'completed') {
            newStatus = 'completed'
          } else if (data.status === 'failed' || data.status === 'error') {
            newStatus = 'failed'
          }

          // Update order if status changed
          if (newStatus !== order.status) {
            const orderIndex = user.transactions.findIndex(tx => tx.reference === order.reference)
            if (orderIndex !== -1) {
              user.transactions[orderIndex].status = newStatus
              user.transactions[orderIndex].updatedAt = new Date()
              syncResults.updated++
              
              console.log(`✅ Updated order ${order.reference} status from ${order.status} to ${newStatus}`)
            }
          }

          syncResults.details.push({
            reference: order.reference,
            dataXpressRef: order.dataXpressRef,
            oldStatus: order.status,
            newStatus: newStatus,
            dataXpressData: data,
            updated: newStatus !== order.status
          })
        } else {
          console.log(`❌ DataXpress status check failed for ${order.dataXpressRef}: ${response.status}`)
          syncResults.errors++
          syncResults.details.push({
            reference: order.reference,
            dataXpressRef: order.dataXpressRef,
            error: `DataXpress API error: ${response.status}`,
            updated: false
          })
        }
      } catch (error) {
        console.log(`❌ Error syncing order ${order.reference}:`, error.message)
        syncResults.errors++
        syncResults.details.push({
          reference: order.reference,
          dataXpressRef: order.dataXpressRef,
          error: error.message,
          updated: false
        })
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Save user if any orders were updated
    if (syncResults.updated > 0) {
      await user.save()
      console.log(`✅ Saved ${syncResults.updated} updated orders for user ${email}`)
    }

    return NextResponse.json({
      success: true,
      data: syncResults
    })

  } catch (error) {
    console.error('Error syncing orders:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to sync orders',
      details: error.message
    }, { status: 500 })
  }
}
