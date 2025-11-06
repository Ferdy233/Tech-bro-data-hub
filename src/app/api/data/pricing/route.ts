import { NextRequest, NextResponse } from 'next/server'

const DATAXPRESS_API_KEY = process.env.DATAXPRESS_API_KEY
const DATAXPRESS_BASE_URL = process.env.DATAXPRESS_BASE_URL || 'https://www.dataxpress.shop'

export async function POST(request: NextRequest) {
  try {
    const { volumeInMB, networkType } = await request.json()

    // Validate required fields
    if (!volumeInMB || !networkType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate network type
    const validNetworks = ['mtn', 'telecel', 'tigo', 'airteltigo']
    if (!validNetworks.includes(networkType.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid network type' },
        { status: 400 }
      )
    }

    // Get pricing from DataXpress
    const response = await fetch(`${DATAXPRESS_BASE_URL}/api/get-cost-price`, {
      method: 'POST',
      headers: {
        'X-API-KEY': DATAXPRESS_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        volumeInMB,
        networkType: networkType.toLowerCase()
      })
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to get pricing' },
        { status: 500 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        cost: data.data?.cost || 0,
        volumeInMB,
        networkType: networkType.toLowerCase()
      }
    })

  } catch (error) {
    console.error('Pricing error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
