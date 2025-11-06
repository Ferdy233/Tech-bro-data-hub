'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Loader2, 
  Shield, 
  ArrowRight, 
  Lock,
  Sparkles
} from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      // Show fallback for a moment before redirecting
      setShowFallback(true)
      setTimeout(() => {
        router.push('/welcome')
      }, 2000)
    }
  }, [user, isLoading, router])

  // Show loading spinner while checking auth
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
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-xl font-semibold text-gray-900">Loading...</span>
          </div>
          <p className="text-gray-600">Please wait while we verify your access</p>
        </div>
      </div>
    )
  }

  // Show fallback if user is not authenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-2xl">TB</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Access Required
            </h1>
            <p className="text-gray-600">
              Please sign in to access Tech Bro Hub
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 rounded-full p-3">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
              Authentication Required
            </h2>
            
            <p className="text-gray-600 text-center mb-8">
              You need to be signed in to access this page. Please sign in or create an account to continue.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/signin')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <Shield className="h-5 w-5 mr-2" />
                Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
              
              <button
                onClick={() => router.push('/signup')}
                className="w-full border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Create Account
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Redirecting to welcome page in a moment...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated, show protected content
  return <>{children}</>
}
