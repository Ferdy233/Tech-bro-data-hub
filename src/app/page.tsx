'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-200px] left-[-100px] w-[400px] h-[400px] bg-amber-400/3 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/60 mb-8">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-slate-300 text-xs font-medium tracking-wide">DELIVERY IN SECONDS</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Get <span className="text-amber-400">More Data</span><br />
              For Less.
            </h1>

            <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-10 max-w-md">
              Compare affordable MTN, Telecel, and AirtelTigo bundle prices, top up instantly, and enjoy secure payments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/buy-data"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-amber-400 text-slate-900 font-bold text-sm hover:bg-amber-300 hover:-translate-y-0.5 transition-all duration-200 shadow-lg shadow-amber-400/20"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/track-orders"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-slate-600 text-slate-300 font-medium text-sm hover:border-amber-400/60 hover:text-white transition-all duration-200"
              >
                <Search className="h-4 w-4" />
                Track Order
              </Link>
            </div>
          </div>

          {/* Right - Floating Card Mockup */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              {/* Background card (offset) */}
              <div className="absolute top-6 -left-6 w-64 h-72 bg-slate-800/40 rounded-2xl border border-slate-700/40 -rotate-6" />

              {/* Main card */}
              <div className="relative w-64 bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl shadow-black/30">
                <div className="flex items-center gap-2 mb-6">
                  <Image src="/mtn.jpg" alt="MTN" width={28} height={28} className="rounded-full" />
                  <span className="text-slate-400 text-xs font-medium">MTN Bundle</span>
                </div>

                <p className="text-4xl font-bold text-white mb-1">20 GB</p>
                <p className="text-amber-400 text-xs font-semibold tracking-wider mb-6">PREMIUM PASS</p>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-slate-500 text-xs">Price</p>
                    <p className="text-white font-bold text-lg">\u20b583</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs">Validity</p>
                    <p className="text-slate-300 font-medium text-sm">30 days</p>
                  </div>
                </div>

                <div className="mt-6 w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 text-xs font-bold text-center tracking-wider">
                  GET THIS BUNDLE
                </div>
              </div>

              {/* Small floating badge */}
              <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                INSTANT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Networks Strip */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <p className="text-slate-500 text-xs font-medium tracking-wider text-center mb-6">AVAILABLE NETWORKS</p>
        <div className="flex items-center justify-center gap-8 md:gap-16">
          <Image src="/mtn.jpg" alt="MTN" width={40} height={40} className="rounded-full opacity-70 hover:opacity-100 transition-opacity" />
          <Image src="/telecel.png" alt="Telecel" width={40} height={40} className="rounded-full opacity-70 hover:opacity-100 transition-opacity" />
          <Image src="/at.png" alt="AirtelTigo" width={40} height={40} className="rounded-full opacity-70 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  )
}
