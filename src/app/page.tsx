import Link from 'next/link'
import {
  Database,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  Wifi,
} from 'lucide-react'

const benefits = [
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Data bundles arrive on your phone within seconds of purchase',
  },
  {
    icon: Shield,
    title: 'Secure Checkout',
    description: 'Every transaction is processed over an encrypted connection',
  },
  {
    icon: Wifi,
    title: 'All Major Networks',
    description: 'MTN, Telecel, and AirtelTigo bundles, all in one place',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/80 to-indigo-900/80"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              Fast, reliable data bundles
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Buy Data with{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Tech Bro Hub
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Top up MTN, Telecel, and AirtelTigo data bundles in seconds.
            </p>

            <div className="flex justify-center">
              <Link
                href="/buy-data"
                className="inline-flex items-center px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold text-lg shadow-lg hover:shadow-2xl hover:bg-blue-50 transition-all duration-300"
              >
                <Database className="h-5 w-5 mr-2" />
                Buy Data Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Fast,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reliable
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to stay connected, without the hassle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to top up?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Choose your network, pick a bundle, and you&apos;re done.
          </p>
          <Link
            href="/buy-data"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Get Started
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  )
}
