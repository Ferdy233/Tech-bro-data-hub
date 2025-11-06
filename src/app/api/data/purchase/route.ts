import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

const DATAXPRESS_API_KEY = process.env.DATAXPRESS_API_KEY
const DATAXPRESS_BASE_URL = process.env.DATAXPRESS_BASE_URL || 'https://www.dataxpress.shop'
const MOCK_MODE = process.env.NODE_ENV === 'development' && (process.env.MOCK_DATAXPRESS === 'true' || process.env.DATAXPRESS_API_KEY?.includes('test'))

export async function POST(request: NextRequest) {
  try {
    const { phone, volumeInMB, networkType, userEmail } = await request.json()
    
    console.log('Data purchase request received:', { phone, volumeInMB, networkType, userEmail })

    // Validate required fields
    if (!phone || !volumeInMB || !networkType || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate network type
    const validNetworks = ['mtn', 'telecel', 'tigo', 'airteltigo']
    const normalizedNetworkType = networkType.toLowerCase()
    console.log('Validating network type:', { networkType, normalizedNetworkType, validNetworks })
    
    if (!validNetworks.includes(normalizedNetworkType)) {
      console.error('Invalid network type:', { networkType, normalizedNetworkType, validNetworks })
      return NextResponse.json(
        { success: false, error: `Invalid network type: ${networkType}. Valid options: ${validNetworks.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate phone number format (Ghana format)
    const phoneRegex = /^(0[235][0-9]{8})|(233[235][0-9]{8})$/
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Find user
    const user = await User.findOne({ email: userEmail })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if API key is available (unless in mock mode)
    if (!MOCK_MODE && !DATAXPRESS_API_KEY) {
      console.error('DATAXPRESS_API_KEY is not set')
      return NextResponse.json(
        { success: false, error: 'DataXpress API key not configured' },
        { status: 500 }
      )
    }

    if (MOCK_MODE) {
      console.log('Running in MOCK mode for DataXpress API')
    }

    // Get current pricing from DataXpress
    console.log('Getting pricing from DataXpress...', { 
      url: `${DATAXPRESS_BASE_URL}/api/get-cost-price`,
      volumeInMB,
      networkType: normalizedNetworkType 
    })
    
    let cost = 0
    
    if (MOCK_MODE) {
      // Use fallback pricing in mock mode
      const fallbackPricing: { [key: number]: number } = {
        1000: 4.40,   // 1GB
        2000: 9.00,   // 2GB
        3000: 13.00,  // 3GB
        4000: 18.00,  // 4GB (not available for MTN)
        5000: 22.00,  // 5GB
        6000: 26.00,  // 6GB
        8000: 35.00,  // 8GB
        10000: 42.00, // 10GB
        15000: 61.00, // 15GB
        20000: 81.00, // 20GB
        25000: 100.00, // 25GB
        30000: 125.00, // 30GB
        40000: 160.00, // 40GB
        50000: 205.00  // 50GB
      }
      
      // Check if bundle is available for the specific network
      const unavailableForMTN = [4000] // 4GB not available for MTN
      if (normalizedNetworkType === 'mtn' && unavailableForMTN.includes(volumeInMB)) {
        return NextResponse.json(
          { success: false, error: `Bundle ${volumeInMB}MB is not available for MTN network` },
          { status: 400 }
        )
      }
      
      cost = fallbackPricing[volumeInMB] || 0
      console.log('Mock pricing:', cost)
    } else {
      try {
      const pricingResponse = await fetch(`${DATAXPRESS_BASE_URL}/api/get-cost-price`, {
        method: 'POST',
        headers: {
          'X-API-KEY': DATAXPRESS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          volumeInMB,
          networkType: normalizedNetworkType
        })
      })

      if (!pricingResponse.ok) {
        console.error('Pricing API failed:', pricingResponse.status, pricingResponse.statusText)
        const errorText = await pricingResponse.text().catch(() => 'Unknown error')
        console.error('Pricing API error response:', errorText)
        throw new Error(`DataXpress pricing API failed: ${pricingResponse.status} ${pricingResponse.statusText}`)
      }

      const pricingData = await pricingResponse.json().catch(async (error) => {
        console.error('Failed to parse pricing response:', error)
        const textResponse = await pricingResponse.text()
        console.error('Raw pricing response:', textResponse)
        throw error
      })
      
      console.log('Pricing data received:', pricingData)
      cost = pricingData.data?.cost || 0

      if (cost <= 0) {
        throw new Error('Invalid pricing received from DataXpress')
      }
    } catch (pricingError) {
      console.error('DataXpress pricing error, using fallback pricing:', pricingError)
      
      // Fallback pricing based on DataXpress documentation
      const fallbackPricing: { [key: number]: number } = {
        1000: 4.40,   // 1GB
        2000: 9.00,   // 2GB
        3000: 13.00,  // 3GB
        4000: 18.00,  // 4GB (not available for MTN)
        5000: 22.00,  // 5GB
        6000: 26.00,  // 6GB
        8000: 35.00,  // 8GB
        10000: 42.00, // 10GB
        15000: 61.00, // 15GB
        20000: 81.00, // 20GB
        25000: 100.00, // 25GB
        30000: 125.00, // 30GB
        40000: 160.00, // 40GB
        50000: 205.00  // 50GB
      }
      
      // Check if bundle is available for the specific network
      const unavailableForMTN = [4000] // 4GB not available for MTN
      if (normalizedNetworkType === 'mtn' && unavailableForMTN.includes(volumeInMB)) {
        throw new Error(`Bundle ${volumeInMB}MB is not available for MTN network`)
      }
      
      cost = fallbackPricing[volumeInMB] || 0
      
      if (cost <= 0) {
        return NextResponse.json(
          { success: false, error: `Pricing not available for ${volumeInMB}MB bundle. Please try a different size.` },
          { status: 400 }
        )
      }
      
      console.log('Using fallback pricing:', cost)
    }
    }

    // Check if user has sufficient balance
    if (user.walletBalance < cost) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient wallet balance. You have ₵${user.walletBalance.toFixed(2)} but need ₵${cost.toFixed(2)}`,
          requiredAmount: cost,
          currentBalance: user.walletBalance
        },
        { status: 400 }
      )
    }

    // Generate unique reference
    const ref = `TB_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    console.log('Purchasing data from DataXpress...', { ref, phone, volumeInMB, networkType })

    let purchaseData: any = null
    
    if (MOCK_MODE) {
      // Mock successful purchase
      purchaseData = {
        status: 'success',
        data: {
          reference: ref,
          phone: phone.replace(/\s+/g, ''),
          volume: volumeInMB,
          network: normalizedNetworkType.toUpperCase(),
          message: 'Mock data purchase successful'
        }
      }
      console.log('Mock purchase successful:', purchaseData)
    } else {
      try {
      // Purchase data from DataXpress
      const purchaseResponse = await fetch(`${DATAXPRESS_BASE_URL}/api/buy-data`, {
        method: 'POST',
        headers: {
          'X-API-KEY': DATAXPRESS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref,
          phone: phone.replace(/\s+/g, ''), // Remove spaces from phone
          volumeInMB,
          networkType: normalizedNetworkType,
          amount: cost // DataXpress requires the amount field
        })
      })

      if (!purchaseResponse.ok) {
        const errorData = await purchaseResponse.json().catch(() => ({}))
        console.error('DataXpress purchase failed:', purchaseResponse.status, errorData)
        throw new Error(`DataXpress purchase failed: ${purchaseResponse.status} - ${JSON.stringify(errorData)}`)
      }

      purchaseData = await purchaseResponse.json()
      console.log('DataXpress purchase response:', purchaseData)

      // Check if DataXpress purchase was successful
      if (!purchaseData.status || purchaseData.status !== 'success') {
        throw new Error(`DataXpress purchase not successful: ${purchaseData.message || 'Unknown error'}`)
      }
    } catch (purchaseError) {
      console.error('DataXpress purchase error:', purchaseError)
      
      // In development, simulate successful purchase for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating successful DataXpress purchase')
        purchaseData = {
          status: 'success',
          data: {
            reference: ref,
            phone: phone.replace(/\s+/g, ''),
            volume: volumeInMB,
            network: normalizedNetworkType.toUpperCase(),
            message: 'Development mode - simulated purchase'
          }
        }
      } else {
        // For now, we'll return an error if DataXpress is down
        // In production, you might want to queue the request or use a different provider
        return NextResponse.json(
          { 
            success: false, 
            error: 'DataXpress service is currently unavailable. Please try again later.',
            details: purchaseError.message
          },
          { status: 503 }
        )
      }
    }
    }

    // Only deduct from wallet if DataXpress purchase was successful
    const oldBalance = user.walletBalance
    user.walletBalance -= cost

    // Add transaction record
    const transaction = {
      type: 'debit',
      amount: cost,
      description: `Data purchase - ${volumeInMB}MB ${normalizedNetworkType.toUpperCase()} for ${phone}`,
      reference: ref,
      status: 'completed',
      dataXpressRef: purchaseData.data?.reference || ref,
      phone: phone,
      volume: volumeInMB,
      network: normalizedNetworkType.toUpperCase(),
      createdAt: new Date()
    }

    user.transactions.push(transaction)
    await user.save()

    console.log('Transaction completed successfully:', {
      ref,
      cost,
      newBalance: user.walletBalance,
      phone,
      network: normalizedNetworkType
    })

    return NextResponse.json({
      success: true,
      data: {
        transaction: purchaseData,
        newBalance: user.walletBalance,
        oldBalance: oldBalance,
        cost,
        reference: ref,
        phone: phone,
        volume: volumeInMB,
        network: normalizedNetworkType.toUpperCase(),
        message: `Data bundle successfully delivered to ${phone}`
      }
    })

  } catch (error) {
    console.error('Data purchase error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
