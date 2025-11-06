import mongoose, { Document, Schema } from 'mongoose'

export interface IImportItem extends Document {
  name: string
  description: string
  category: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  stock: number
  minOrder: number
  maxOrder: number
  shippingCost: number
  deliveryDays: number
  isAvailable: boolean
  isPreorder: boolean
  preorderETA?: string
  rating: number
  reviews: number
  features: string[]
  createdAt: Date
  updatedAt: Date
}

const ImportItemSchema = new Schema<IImportItem>({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Gaming', 'Audio', 'Accessories', 'Clothing', 'Home & Garden'],
    default: 'Electronics'
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand cannot be more than 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minOrder: {
    type: Number,
    required: [true, 'Minimum order quantity is required'],
    min: [1, 'Minimum order must be at least 1'],
    default: 1
  },
  maxOrder: {
    type: Number,
    required: [true, 'Maximum order quantity is required'],
    min: [1, 'Maximum order must be at least 1'],
    default: 10
  },
  shippingCost: {
    type: Number,
    required: [true, 'Shipping cost is required'],
    min: [0, 'Shipping cost cannot be negative'],
    default: 0
  },
  deliveryDays: {
    type: Number,
    required: [true, 'Delivery days is required'],
    min: [1, 'Delivery days must be at least 1'],
    default: 7
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPreorder: {
    type: Boolean,
    default: false
  },
  preorderETA: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviews: {
    type: Number,
    min: [0, 'Reviews count cannot be negative'],
    default: 0
  },
  features: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

// Index for better search performance
ImportItemSchema.index({ name: 'text', description: 'text', brand: 'text' })
ImportItemSchema.index({ category: 1 })
ImportItemSchema.index({ isAvailable: 1, isPreorder: 1 })

export default mongoose.models.ImportItem || mongoose.model<IImportItem>('ImportItem', ImportItemSchema)





