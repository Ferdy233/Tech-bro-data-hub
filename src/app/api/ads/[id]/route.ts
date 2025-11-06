import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Ad from '@/models/Ad'

// GET - Fetch single ad
export async function GET(
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
    
    return NextResponse.json({ 
      success: true, 
      data: ad 
    })
  } catch (error) {
    console.error('Error fetching ad:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch ad' 
    }, { status: 500 })
  }
}

// PUT - Update ad (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    
    const {
      title,
      description,
      image,
      link,
      type,
      position,
      isActive,
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

    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (image !== undefined) updateData.image = image
    if (link !== undefined) updateData.link = link
    if (type !== undefined) updateData.type = type
    if (position !== undefined) updateData.position = position
    if (isActive !== undefined) updateData.isActive = isActive
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : undefined
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : undefined
    if (advertiserName !== undefined) updateData.advertiserName = advertiserName
    if (advertiserEmail !== undefined) updateData.advertiserEmail = advertiserEmail
    if (advertiserPhone !== undefined) updateData.advertiserPhone = advertiserPhone
    if (budget !== undefined) updateData.budget = budget
    if (costPerClick !== undefined) updateData.costPerClick = costPerClick
    if (costPerImpression !== undefined) updateData.costPerImpression = costPerImpression

    const updatedAd = await Ad.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!updatedAd) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ad not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: updatedAd, 
      message: 'Ad updated successfully' 
    })
  } catch (error) {
    console.error('Error updating ad:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update ad' 
    }, { status: 500 })
  }
}

// DELETE - Delete ad (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const adminEmail = searchParams.get('adminEmail')

    // Basic admin check (TODO: implement proper admin authentication)
    if (!adminEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin authentication required' 
      }, { status: 401 })
    }

    const deletedAd = await Ad.findByIdAndDelete(id)
    
    if (!deletedAd) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ad not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ad deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting ad:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete ad' 
    }, { status: 500 })
  }
}





