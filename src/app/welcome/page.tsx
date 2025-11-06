'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import AdDisplay from '@/components/AdDisplay'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-xl">TB</span>
          </div>
          <div className="absolute -top-1 -right-1">
            <div className="h-4 w-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tech Bro Hub
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-12 max-w-xl mx-auto">
          Your all-in-one platform for business management, payments, and growth tools.
        </p>
        
        {/* CTA Button */}
        <div className="flex justify-center mb-12">
          <Link
            href="/signup"
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Ads Section */}
        <div className="mb-12">
          <AdDisplay position="floating" type="popup" />
        </div>

        {/* Simple Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-500">
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Secure & Fast
          </div>
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Easy to Use
          </div>
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Always Available
          </div>
        </div>
      </div>
    </div>
  )
}