'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Buy Data', href: '/buy-data' },
  { name: 'Track Orders', href: '/track-orders' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/TechBro Logo.png"
              alt="TechBro Data Hub"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-400"
            />
            <div className="ml-3">
              <div className="font-bold text-base leading-tight">
                <span className="text-white">TechBro</span>
                <span className="text-amber-400"> Data Hub</span>
              </div>
              <p className="text-xs text-slate-400 leading-tight">
                Fast, reliable data bundles across major networks.
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isActive
                      ? 'text-amber-400'
                      : 'text-slate-200 hover:text-white',
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900">
          <div className="px-4 py-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium',
                    isActive
                      ? 'text-amber-400 bg-slate-800'
                      : 'text-slate-200 hover:bg-slate-800',
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
