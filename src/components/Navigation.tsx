'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X, Search } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Buy Data', href: '/buy-data' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center h-14 bg-slate-800/90 backdrop-blur-md rounded-full px-5 border border-slate-700/60 shadow-lg shadow-black/10">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/TechBro Logo.png"
              alt="TechBro Data Hub"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-white font-bold text-sm">TechBro</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-slate-700/80 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/40',
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
            <Link
              href="/track-orders"
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                pathname === '/track-orders'
                  ? 'bg-slate-700/80 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/40',
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Track Order
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/buy-data"
              className="px-5 py-2 rounded-full bg-amber-400 text-slate-900 text-sm font-bold hover:bg-amber-300 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-300 hover:bg-slate-700/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden">
            <div className="p-3 space-y-1">
              {[...navigation, { name: 'Track Order', href: '/track-orders' }].map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'text-white bg-slate-700/80'
                        : 'text-slate-300 hover:bg-slate-700/40',
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <Link
                href="/buy-data"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-center bg-amber-400 text-slate-900 mt-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
