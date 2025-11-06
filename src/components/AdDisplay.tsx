'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ExternalLink } from 'lucide-react'

interface Ad {
  _id?: string
  id?: string
  title: string
  description: string
  image: string
  link?: string
  type: 'banner' | 'sidebar' | 'popup' | 'inline'
  position: string
  isActive: boolean
  startDate?: string
  endDate?: string
  clicks: number
  impressions: number
  advertiserName: string
  advertiserEmail: string
  advertiserPhone?: string
  budget?: number
  costPerClick?: number
  costPerImpression?: number
  createdAt: string
  updatedAt: string
}

interface AdDisplayProps {
  position: string
  type?: 'banner' | 'sidebar' | 'popup' | 'inline'
  className?: string
}

export default function AdDisplay({ position, type, className = '' }: AdDisplayProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAds()
  }, [position, type])

  const fetchAds = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        active: 'true',
        position: position
      })
      
      if (type) {
        params.append('type', type)
      }

      const response = await fetch(`/api/ads?${params}`)
      const data = await response.json()

      if (data.success) {
        setAds(data.data.filter((ad: Ad) => !dismissedAds.has(ad._id || ad.id)))
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackClick = async (ad: Ad) => {
    try {
      await fetch(`/api/ads/${ad._id || ad.id}/click`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  const trackImpression = async (ad: Ad) => {
    try {
      await fetch(`/api/ads/${ad._id || ad.id}/click`, {
        method: 'PUT'
      })
    } catch (error) {
      console.error('Error tracking impression:', error)
    }
  }

  const dismissAd = (adId: string) => {
    setDismissedAds(prev => new Set([...prev, adId]))
    setAds(prev => prev.filter(ad => (ad._id || ad.id) !== adId))
    
    // Reset index if needed
    if (currentAdIndex >= ads.length - 1) {
      setCurrentAdIndex(0)
    }
  }

  const nextAd = () => {
    if (ads.length > 1) {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length)
    }
  }

  // Track impression when ad is displayed
  useEffect(() => {
    if (ads.length > 0) {
      const currentAd = ads[currentAdIndex]
      if (currentAd) {
        trackImpression(currentAd)
      }
    }
  }, [ads, currentAdIndex])

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`}>
        <div className="h-32 w-full"></div>
      </div>
    )
  }

  if (ads.length === 0) {
    return null // Don't render anything if no ads
  }

  const currentAd = ads[currentAdIndex]

  if (!currentAd) {
    return null
  }

  const handleAdClick = () => {
    trackClick(currentAd)
    if (currentAd.link) {
      window.open(currentAd.link, '_blank', 'noopener,noreferrer')
    }
  }

  // Different layouts based on ad type
  if (currentAd.type === 'banner') {
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
        <div className="relative">
          <Image
            src={currentAd.image}
            alt={currentAd.title}
            width={300}
            height={150}
            className="w-full h-32 object-cover cursor-pointer"
            onClick={handleAdClick}
          />
          <button
            onClick={() => dismissAd(currentAd._id || currentAd.id)}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-3">
          <h4 className="font-semibold text-sm text-gray-900 mb-1">{currentAd.title}</h4>
          <p className="text-xs text-gray-600 mb-2">{currentAd.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Sponsored by {currentAd.advertiserName}</span>
            {currentAd.link && (
              <ExternalLink className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentAd.type === 'sidebar') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="relative mb-3">
          <Image
            src={currentAd.image}
            alt={currentAd.title}
            width={200}
            height={120}
            className="w-full h-24 object-cover rounded cursor-pointer"
            onClick={handleAdClick}
          />
          <button
            onClick={() => dismissAd(currentAd._id || currentAd.id)}
            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-1">{currentAd.title}</h4>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{currentAd.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Sponsored</span>
            {currentAd.link && (
              <ExternalLink className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentAd.type === 'popup') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white rounded-lg max-w-md w-full mx-4 relative">
          <button
            onClick={() => dismissAd(currentAd._id || currentAd.id)}
            className="absolute top-2 right-2 bg-gray-100 text-gray-600 rounded-full p-1 hover:bg-gray-200 z-10"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="p-6">
            <div className="relative mb-4">
              <Image
                src={currentAd.image}
                alt={currentAd.title}
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded cursor-pointer"
                onClick={handleAdClick}
              />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-gray-900 mb-2">{currentAd.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{currentAd.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Sponsored by {currentAd.advertiserName}</span>
                {currentAd.link && (
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default inline ad
  return (
    <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Image
            src={currentAd.image}
            alt={currentAd.title}
            width={80}
            height={80}
            className="w-20 h-20 object-cover rounded cursor-pointer"
            onClick={handleAdClick}
          />
          <button
            onClick={() => dismissAd(currentAd._id || currentAd.id)}
            className="absolute -top-1 -right-1 bg-gray-600 text-white rounded-full p-1 hover:bg-gray-700"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm text-gray-900 mb-1">{currentAd.title}</h4>
          <p className="text-xs text-gray-600 mb-2">{currentAd.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Sponsored</span>
            {currentAd.link && (
              <ExternalLink className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





