import mongoose, { Document, Schema } from 'mongoose'

export interface ITransaction {
  reference: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'completed'
  type: 'credit' | 'debit'
  description: string
  createdAt: Date
  paystackData?: any
  // Data purchase fields
  dataXpressRef?: string
  phone?: string
  volume?: number
  network?: string
  // Import order fields
  importItems?: Array<{
    id: string
    name: string
    brand: string
    price: number
    shippingCost: number
    quantity: number
    total: number
    isPreorder: boolean
  }>
  shippingAddress?: {
    name: string
    address: string
    phone: string
  }
  trackingNumber?: string
  deliveryDate?: Date
  notes?: string
}

export interface IUser extends Document {
  name: string
  email: string
  password: string
  phone?: string
  role: 'user' | 'admin'
  isVerified: boolean
  verificationCode?: string
  verificationCodeExpires?: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  walletBalance?: number
  transactions?: ITransaction[]
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  walletBalance: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative']
  },
  transactions: [{
    reference: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'GHS'
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'completed'],
      default: 'pending'
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    paystackData: Schema.Types.Mixed,
    // Data purchase fields
    dataXpressRef: String,
    phone: String,
    volume: Number,
    network: String,
    // Import order fields
    importItems: [{
      id: String,
      name: String,
      brand: String,
      price: Number,
      shippingCost: Number,
      quantity: Number,
      total: Number,
      isPreorder: Boolean
    }],
    shippingAddress: {
      name: String,
      address: String,
      phone: String
    },
    trackingNumber: String,
    deliveryDate: Date,
    notes: String
  }]
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const bcrypt = await import('bcryptjs')
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})


// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
