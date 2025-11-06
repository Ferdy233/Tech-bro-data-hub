require('dotenv').config()
const mongoose = require('mongoose')

const AdSchema = new mongoose.Schema({
  title: String,
  position: String,
  type: String,
  isActive: Boolean
})

const Ad = mongoose.model('Ad', AdSchema)

async function checkAds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    const ads = await Ad.find({})
    console.log(`\n📋 Found ${ads.length} ads in database:`)
    
    ads.forEach((ad, index) => {
      console.log(`${index + 1}. ${ad.title}`)
      console.log(`   Type: ${ad.type}`)
      console.log(`   Position: ${ad.position}`)
      console.log(`   Active: ${ad.isActive}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

checkAds()





