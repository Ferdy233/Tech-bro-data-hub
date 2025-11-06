import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ImportItem from '@/models/ImportItem'

// GET - Fetch all import items
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Fetch items from database
    const items = await ImportItem.find({}).sort({ createdAt: -1 })

    // If no items in database, return mock data as fallback
    if (items.length === 0) {
      const mockItems = [
      {
        id: '1',
        name: 'iPhone 15 Pro Max',
        description: 'Latest iPhone with titanium design and advanced camera system',
        category: 'Electronics',
        brand: 'Apple',
        price: 8500,
        originalPrice: 9000,
        image: 'https://via.placeholder.com/300x300/cccccc/666666?text=iPhone+15+Pro+Max',
        stock: 15,
        minOrder: 1,
        maxOrder: 5,
        shippingCost: 150,
        deliveryDays: 7,
        isAvailable: true,
        isPreorder: false,
        rating: 4.8,
        reviews: 127,
        features: ['A17 Pro Chip', 'Titanium Design', '48MP Camera', 'USB-C']
      },
      {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen and advanced AI features',
        category: 'Electronics',
        brand: 'Samsung',
        price: 7200,
        originalPrice: 7800,
        image: 'https://via.placeholder.com/300x300/cccccc/666666?text=Samsung+Galaxy+S24',
        stock: 0,
        minOrder: 1,
        maxOrder: 3,
        shippingCost: 120,
        deliveryDays: 10,
        isAvailable: false,
        isPreorder: true,
        preorderETA: '2024-03-15',
        rating: 4.7,
        reviews: 89,
        features: ['S Pen', '200MP Camera', 'AI Features', 'Titanium Frame']
      },
      {
        id: '3',
        name: 'MacBook Pro M3',
        description: 'Professional laptop with M3 chip for creators and developers',
        category: 'Electronics',
        brand: 'Apple',
        price: 12000,
        originalPrice: 13000,
        image: 'https://via.placeholder.com/300x300/cccccc/666666?text=MacBook+Pro+M3',
        stock: 8,
        minOrder: 1,
        maxOrder: 2,
        shippingCost: 200,
        deliveryDays: 14,
        isAvailable: true,
        isPreorder: false,
        rating: 4.9,
        reviews: 56,
        features: ['M3 Chip', 'Retina Display', '18-hour Battery', 'Thunderbolt 4']
      },
      {
        id: '4',
        name: 'Sony PlayStation 5',
        description: 'Next-gen gaming console with 4K gaming and ray tracing',
        category: 'Gaming',
        brand: 'Sony',
        price: 4500,
        originalPrice: 4800,
        image: 'https://via.placeholder.com/300x300/cccccc/666666?text=PlayStation+5',
        stock: 0,
        minOrder: 1,
        maxOrder: 1,
        shippingCost: 100,
        deliveryDays: 21,
        isAvailable: false,
        isPreorder: true,
        preorderETA: '2024-04-01',
        rating: 4.6,
        reviews: 234,
        features: ['4K Gaming', 'Ray Tracing', 'SSD Storage', 'DualSense Controller']
      },
      {
        id: '5',
        name: 'AirPods Pro (2nd Gen)',
        description: 'Premium wireless earbuds with active noise cancellation',
        category: 'Audio',
        brand: 'Apple',
        price: 850,
        originalPrice: 900,
        image: 'https://via.placeholder.com/300x300/cccccc/666666?text=AirPods+Pro',
        stock: 25,
        minOrder: 1,
        maxOrder: 10,
        shippingCost: 50,
        deliveryDays: 5,
        isAvailable: true,
        isPreorder: false,
        rating: 4.5,
        reviews: 312,
        features: ['Active Noise Cancellation', 'Spatial Audio', 'Wireless Charging', 'H2 Chip']
      }
    ]

      return NextResponse.json({
        success: true,
        data: mockItems
      })
    }

    // Return database items
    return NextResponse.json({
      success: true,
      data: items
    })

  } catch (error) {
    console.error('Error fetching import items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch import items' },
      { status: 500 }
    )
  }
}

// POST - Create new import item (Admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
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
    // For now, allow creation if adminEmail is provided
    if (!adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!name || !description || !category || !brand || !price || !image) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new item in database
    const newItem = new ImportItem({
      name,
      description,
      category,
      brand,
      price,
      originalPrice,
      image,
      stock: stock || 0,
      minOrder: minOrder || 1,
      maxOrder: maxOrder || 10,
      shippingCost: shippingCost || 0,
      deliveryDays: deliveryDays || 7,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isPreorder: isPreorder || false,
      preorderETA,
      rating: 0,
      reviews: 0,
      features: features || []
    })

    await newItem.save()

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Import item created successfully'
    })

  } catch (error) {
    console.error('Error creating import item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create import item' },
      { status: 500 }
    )
  }
}
