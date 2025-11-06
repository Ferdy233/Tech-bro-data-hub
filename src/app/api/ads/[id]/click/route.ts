import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Ad from '@/models/Ad'

// POST - Track ad click
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const ad = await Ad.findById(id)
    
    if (!ad) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ad not found' 
      }, { status: 404 })
    }

    // Increment click count
    await Ad.findByIdAndUpdate(id, { $inc: { clicks: 1 } })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Click tracked successfully' 
    })
  } catch (error) {
    console.error('Error tracking ad click:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to track click' 
    }, { status: 500 })
  }
}

// POST - Track ad impression
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const ad = await Ad.findById(id)
    
    if (!ad) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ad not found' 
      }, { status: 404 })
    }

    // Increment impression count
    await Ad.findByIdAndUpdate(id, { $inc: { impressions: 1 } })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Impression tracked successfully' 
    })
  } catch (error) {
    console.error('Error tracking ad impression:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to track impression' 
    }, { status: 500 })
  }
}





