const mongoose = require('mongoose');
require('dotenv').config();

// Simple User schema for this script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: Boolean,
  walletBalance: Number
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function checkUserRole(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      return;
    }

    // Display user details
    console.log('📋 User Details:');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Verified: ${user.isVerified}`);
    console.log(`Wallet Balance: ${user.walletBalance || 0}`);
    console.log(`Created: ${user.createdAt}`);

    // Check if they should have admin access
    if (user.role === 'admin') {
      console.log('✅ User has admin role - should have access to admin panel');
    } else {
      console.log('❌ User does not have admin role');
      console.log('To promote to admin, run: npm run promote-user ' + email);
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('Usage: node scripts/check-user-role.js <user-email>');
  console.log('Example: node scripts/check-user-role.js john@example.com');
  process.exit(1);
}

checkUserRole(userEmail);





