import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ImportItem from '@/models/ImportItem'

// GET - Get single import item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params

    const item = await ImportItem.findById(id)
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item
    })

  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

// PUT - Update import item (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      category,
      brand,
      price,
      originalPrice,
      image,
      stock,
      minOrder,
      maxOrder,
      shippingCost,
      deliveryDays,
      isAvailable,
      isPreorder,
      preorderETA,
      features,
      adminEmail
    } = body

    // TODO: Add admin authentication check
    if (!adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    // Find the item
    const item = await ImportItem.findById(id)
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    }

    // Update the item
    const updatedItem = await ImportItem.findByIdAndUpdate(
      id,
      {
        name,
        description,
        category,
        brand,
        price,
        originalPrice,
        image,
        stock,
        minOrder,
        maxOrder,
        shippingCost,
        deliveryDays,
        isAvailable,
        isPreorder,
        preorderETA,
        features
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Item updated successfully'
    })

  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

// DELETE - Delete import item (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const adminEmail = searchParams.get('adminEmail')

    // TODO: Add admin authentication check
    if (!adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    // Find and delete the item
    const item = await ImportItem.findByIdAndDelete(id)
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
