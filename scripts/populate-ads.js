require('dotenv').config()
const mongoose = require('mongoose')

// Ad schema (simplified for this script)
const AdSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  link: String,
  type: { type: String, enum: ['banner', 'sidebar', 'popup', 'inline'] },
  position: String,
  isActive: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
  clicks: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  advertiserName: String,
  advertiserEmail: String,
  advertiserPhone: String,
  budget: Number,
  costPerClick: Number,
  costPerImpression: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Ad = mongoose.model('Ad', AdSchema)

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

const sampleAds = [
  {
    title: "Best Data Bundles in Ghana",
    description: "Get the cheapest and fastest data bundles for all networks. MTN, Vodafone, AirtelTigo available.",
    image: "https://via.placeholder.com/300x150/4F46E5/FFFFFF?text=Data+Bundles",
    link: "https://example.com/data-bundles",
    type: "banner",
    position: "header",
    isActive: true,
    advertiserName: "DataPro Ghana",
    advertiserEmail: "contact@dataproghana.com",
    advertiserPhone: "+233123456789",
    budget: 5000,
    costPerClick: 0.50,
    costPerImpression: 0.02
  },
  {
    title: "iPhone 15 Pro Max - Preorder Now",
    description: "Latest iPhone with advanced features. Free shipping and warranty included.",
    image: "https://via.placeholder.com/200x120/10B981/FFFFFF?text=iPhone+15",
    link: "https://example.com/iphone",
    type: "sidebar",
    position: "sidebar",
    isActive: true,
    advertiserName: "TechStore Ghana",
    advertiserEmail: "sales@techstoregh.com",
    advertiserPhone: "+233987654321",
    budget: 8000,
    costPerClick: 1.00,
    costPerImpression: 0.05
  },
  {
    title: "Currency Exchange Service",
    description: "Exchange your currencies at the best rates. Fast, secure, and reliable service.",
    image: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Currency+Exchange",
    link: "https://example.com/exchange",
    type: "inline",
    position: "content-top",
    isActive: true,
    advertiserName: "Forex Solutions",
    advertiserEmail: "info@forexsolutions.com",
    advertiserPhone: "+233555123456",
    budget: 3000,
    costPerClick: 0.75,
    costPerImpression: 0.03
  },
  {
    title: "Import Services - Get Anything",
    description: "We import anything you need from anywhere in the world. Competitive prices and fast delivery.",
    image: "https://via.placeholder.com/250x150/EF4444/FFFFFF?text=Import+Services",
    link: "https://example.com/imports",
    type: "banner",
    position: "footer",
    isActive: true,
    advertiserName: "Global Imports Ltd",
    advertiserEmail: "orders@globalimports.com",
    advertiserPhone: "+233777888999",
    budget: 6000,
    costPerClick: 0.80,
    costPerImpression: 0.04
  },
  {
    title: "Special Offer - 50% Off",
    description: "Limited time offer! Get 50% off on all our services. Don't miss out!",
    image: "https://via.placeholder.com/300x150/8B5CF6/FFFFFF?text=50%25+OFF",
    link: "https://example.com/special-offer",
    type: "popup",
    position: "floating",
    isActive: true,
    advertiserName: "MegaDeals Ghana",
    advertiserEmail: "promo@megadeals.com",
    advertiserPhone: "+233444555666",
    budget: 4000,
    costPerClick: 1.20,
    costPerImpression: 0.06
  }
]

async function populateAds() {
  try {
    await connectDB()
    
    // Clear existing ads
    await Ad.deleteMany({})
    console.log('🗑️ Cleared existing ads')
    
    // Insert sample ads
    const createdAds = await Ad.insertMany(sampleAds)
    console.log(`✅ Created ${createdAds.length} sample ads`)
    
    // Display created ads
    console.log('\n📋 Created Ads:')
    createdAds.forEach((ad, index) => {
      console.log(`${index + 1}. ${ad.title} (${ad.type} - ${ad.position})`)
    })
    
  } catch (error) {
    console.error('❌ Error populating ads:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

populateAds()





