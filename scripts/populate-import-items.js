const mongoose = require('mongoose');
require('dotenv').config();

// Import Item schema
const importItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  brand: String,
  price: Number,
  originalPrice: Number,
  image: String,
  stock: Number,
  minOrder: Number,
  maxOrder: Number,
  shippingCost: Number,
  deliveryDays: Number,
  isAvailable: Boolean,
  isPreorder: Boolean,
  preorderETA: String,
  rating: Number,
  reviews: Number,
  features: [String]
}, {
  timestamps: true
});

const ImportItem = mongoose.model('ImportItem', importItemSchema);

const sampleItems = [
  {
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
];

async function populateItems() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing items
    await ImportItem.deleteMany({});
    console.log('Cleared existing import items');

    // Insert sample items
    const createdItems = await ImportItem.insertMany(sampleItems);
    console.log(`✅ Created ${createdItems.length} import items:`);
    
    createdItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ${item.category} - ${item.brand}`);
    });

    console.log('\n🎉 Database populated successfully!');
    console.log('You can now view these items in the imports page.');

  } catch (error) {
    console.error('❌ Error populating items:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

populateItems();





