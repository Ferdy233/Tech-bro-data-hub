import mongoose, { Schema, Document } from 'mongoose'

export interface IAd extends Document {
  title: string
  description: string
  image: string
  link?: string
  type: 'banner' | 'sidebar' | 'popup' | 'inline'
  position: string
  isActive: boolean
  startDate?: Date
  endDate?: Date
  clicks: number
  impressions: number
  advertiserName: string
  advertiserEmail: string
  advertiserPhone?: string
  budget?: number
  costPerClick?: number
  costPerImpression?: number
  createdAt: Date
  updatedAt: Date
}

const AdSchema = new Schema<IAd>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String },
  type: { 
    type: String, 
    enum: ['banner', 'sidebar', 'popup', 'inline'], 
    required: true 
  },
  position: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  clicks: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  advertiserName: { type: String, required: true },
  advertiserEmail: { type: String, required: true },
  advertiserPhone: { type: String },
  budget: { type: Number },
  costPerClick: { type: Number },
  costPerImpression: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

AdSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Ad || mongoose.model<IAd>('Ad', AdSchema)





