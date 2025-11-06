import connectDB from './mongodb'
import User from '@/models/User'

export interface AdminUser {
  email: string
  name: string
  role: 'admin'
}

// Function to promote a user to admin
export async function promoteUserToAdmin(email: string): Promise<boolean> {
  try {
    await connectDB()
    
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('User not found')
    }

    user.role = 'admin'
    await user.save()

    console.log(`User ${email} has been promoted to admin`)
    return true
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    return false
  }
}

// Function to demote an admin to regular user
export async function demoteAdminToUser(email: string): Promise<boolean> {
  try {
    await connectDB()
    
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('User not found')
    }

    user.role = 'user'
    await user.save()

    console.log(`Admin ${email} has been demoted to regular user`)
    return true
  } catch (error) {
    console.error('Error demoting admin to user:', error)
    return false
  }
}

// Function to check if user is admin
export async function isUserAdmin(email: string): Promise<boolean> {
  try {
    await connectDB()
    
    const user = await User.findOne({ email })
    return user?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Function to get all admin users
export async function getAllAdmins(): Promise<AdminUser[]> {
  try {
    await connectDB()
    
    const admins = await User.find({ role: 'admin' }).select('email name role')
    return admins.map(admin => ({
      email: admin.email,
      name: admin.name,
      role: admin.role as 'admin'
    }))
  } catch (error) {
    console.error('Error fetching admins:', error)
    return []
  }
}

// Function to create a default admin user (for initial setup)
export async function createDefaultAdmin(): Promise<boolean> {
  try {
    await connectDB()
    
    const adminEmail = 'admin@techbrohub.com'
    const existingAdmin = await User.findOne({ email: adminEmail })
    
    if (existingAdmin) {
      console.log('Admin user already exists')
      return true
    }

    // Create default admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: adminEmail,
      password: 'admin123', // This should be changed immediately
      role: 'admin',
      isVerified: true,
      walletBalance: 0
    })

    await adminUser.save()
    console.log('Default admin user created successfully')
    console.log('Email: admin@techbrohub.com')
    console.log('Password: admin123')
    console.log('⚠️  Please change the password immediately after first login!')
    
    return true
  } catch (error) {
    console.error('Error creating default admin:', error)
    return false
  }
}

