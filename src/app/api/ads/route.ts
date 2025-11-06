import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Ad from '@/models/Ad'

// GET - Fetch all ads (for admin panel and dashboard display)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const type = searchParams.get('type')
    const position = searchParams.get('position')

    let query: any = {}
    
    if (active === 'true') {
      query.isActive = true
      // Only show ads that are within their date range
      const now = new Date()
      query.$and = [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: now } }
          ]
        }
      ]
    }
    
    if (type) {
      query.type = type
    }
    
    if (position) {
      query.position = position
    }

    const ads = await Ad.find(query).sort({ createdAt: -1 })
    
    return NextResponse.json({ 
      success: true, 
      data: ads 
    })
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch ads' 
    }, { status: 500 })
  }
}

// POST - Create new ad (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const {
      title,
      description,
      image,
      link,
      type,
      position,
      startDate,
      endDate,
      advertiserName,
      advertiserEmail,
      advertiserPhone,
      budget,
      costPerClick,
      costPerImpression,
      adminEmail
    } = body

    // Basic admin check (TODO: implement proper admin authentication)
    if (!adminEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin authentication required' 
      }, { status: 401 })
    }

    if (!title || !description || !image || !type || !position || !advertiserName || !advertiserEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    const newAd = new Ad({
      title,
      description,
      image,
      link,
      type,
      position,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      advertiserName,
      advertiserEmail,
      advertiserPhone,
      budget,
      costPerClick,
      costPerImpression
    })

    await newAd.save()
    
    return NextResponse.json({ 
      success: true, 
      data: newAd, 
      message: 'Ad created successfully' 
    })
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create ad' 
    }, { status: 500 })
  }
}
