'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const adminNav = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Analytics', href: '/admin/analytics' },
  { name: 'Bundles', href: '/admin/bundles' },
  { name: 'Pending Orders', href: '/admin/pending-orders' },
  { name: 'Orders', href: '/admin/orders' },
  { name: 'Settings', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authStatus, setAuthStatus] = useState<'unknown' | 'authenticated' | 'anonymous'>('unknown')
  const isLoginRoute = pathname === '/admin/login' || pathname.startsWith('/admin/login')

  useEffect(() => {
    const cookieAuth = document.cookie.split(';').some((cookie) => cookie.trim().startsWith('admin-auth=1'))
    const storageAuth = window.localStorage.getItem('admin-auth') === '1'
    const isAuthenticated = cookieAuth || storageAuth

    setAuthStatus(isAuthenticated ? 'authenticated' : 'anonymous')

    if (!isAuthenticated && !isLoginRoute) {
      router.replace('/admin/login')
    }

    if (isAuthenticated && isLoginRoute) {
      router.replace('/admin')
    }
  }, [pathname, router, isLoginRoute])

  const handleSignOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.localStorage.removeItem('admin-auth')
    router.replace('/admin/login')
  }

  if (isLoginRoute) {
    return (
      <div className="min-h-screen bg-slate-950">
        <main className="max-w-xl mx-auto px-4 py-20">{children}</main>
      </div>
    )
  }

  if (authStatus === 'unknown') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        Loading admin access...
      </div>
    )
  }

  if (authStatus === 'anonymous') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-black/25">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-400">Admin Dashboard</p>
              <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Owner control center</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Review revenue, monitor orders, and configure your store from one secure place.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {adminNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-400 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/20">
          {children}
        </div>
      </div>
    </div>
  )
}
