'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import AdDisplay from '@/components/AdDisplay'
import Link from 'next/link'
import { 
  Package, 
  Database, 
  Calculator, 
  Megaphone, 
  TrendingUp,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Sparkles,
  CheckCircle,
  Globe,
  Headphones
} from 'lucide-react'

const features = [
  {
    name: 'Imports Management',
    description: 'Track and manage your import orders, inventory, and suppliers efficiently with real-time updates.',
    icon: Package,
    href: '/imports',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    stats: '2.5K+ Orders',
    features: ['Real-time tracking', 'Inventory management', 'Supplier network']
  },
  {
    name: 'Data Bundles',
    description: 'Purchase mobile data bundles for all networks with instant delivery and competitive rates.',
    icon: Database,
    href: '/buy-data',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    stats: '15K+ Purchases',
    features: ['Instant delivery', 'All networks', 'Competitive rates']
  },
  {
    name: 'Currency Exchange',
    description: 'Convert Naira to Cedis and other currencies with real-time rates and instant processing.',
    icon: Calculator,
    href: '/convert',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    stats: '₵50M+ Volume',
    features: ['Live rates', 'Instant transfer', 'Low fees']
  },
  {
    name: 'Ad Management',
    description: 'Create, manage, and track your advertising campaigns with advanced targeting and analytics.',
    icon: Megaphone,
    href: '/ads',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    stats: '500+ Campaigns',
    features: ['Multi-platform', 'Advanced targeting', 'ROI tracking']
  },
]

const stats = [
  { 
    name: 'Success Rate', 
    value: '99.8%', 
    icon: Shield, 
    change: '+0.2%',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    name: 'Active Orders', 
    value: '1,234', 
    icon: Package, 
    change: '+8%',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    name: 'Data Sales', 
    value: '5,678', 
    icon: Database, 
    change: '+15%',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  { 
    name: 'Exchange Rate', 
    value: '₵1 = ₦8.33', 
    icon: TrendingUp, 
    change: '+2%',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
]


const benefits = [
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Bank-level security with 99.9% uptime guarantee'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process transactions in under 30 seconds'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support team'
  },
  {
    icon: Globe,
    title: 'Multi-Currency',
    description: 'Support for all major African currencies'
  }
]

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/welcome')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="h-16 w-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-2xl">TB</span>
            </div>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-xl font-semibold text-gray-900">Loading...</span>
          </div>
          <p className="text-gray-600">Please wait while we verify your access</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to welcome
  }

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/80 to-indigo-900/80"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              Trusted by 1000+ users
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Tech Bro Hub
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Your all-in-one platform for imports, data bundles, currency exchange, 
              and ad management. Built for African entrepreneurs.
            </p>
            

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-sm">Bank-level Security</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                <span className="text-sm">Lightning Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div 
                key={stat.name} 
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} rounded-xl p-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-semibold text-green-600">{stat.change} from last month</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Scale Your Business
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful tools designed specifically for African entrepreneurs and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.name}
                href={feature.href}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`bg-gradient-to-r ${feature.color} rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-500">{feature.stats}</p>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 flex-grow">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {feature.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Ads Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdDisplay position="content-top" type="inline" />
          <AdDisplay position="content-top" type="banner" />
          <AdDisplay position="content-top" type="inline" />
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose Tech Bro Hub?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with African businesses in mind, we provide the tools you need to succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 group-hover:bg-white/20 transition-all duration-300 transform group-hover:scale-105">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                    <p className="text-gray-300">{benefit.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
    </AuthGuard>
  )
}