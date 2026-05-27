'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
        }}
      ></div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800/50 backdrop-blur-sm text-slate-300 text-sm font-medium mb-8 border border-slate-700">
              TechBro Data Hub
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">
              TechBro Data Hub
            </h1>

            <p className="text-4xl md:text-5xl font-bold text-amber-400 mb-8">
              bundles
            </p>

            <p className="text-lg text-slate-300 mb-12 max-w-2xl leading-relaxed">
              Kindly be informed that Yello deliveries are running 24/7 all through the night with no breaks 🚀 📱 Keep shopping till you&apos;re tired.... Instant delivery 🍌 🍌
            </p>

            <Link
              href="/buy-data"
              className="inline-flex items-center px-8 py-4 rounded-full bg-amber-400 text-slate-900 font-bold text-lg hover:bg-amber-300 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              BUY DATA
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Right Announcements Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-8 border border-slate-700">
              <div className="mb-6">
                <h3 className="text-amber-400 font-bold text-sm tracking-widest mb-2">
                  ANNOUNCEMENTS
                </h3>
                <h4 className="text-white font-bold text-xl">
                  TechBro Data Hub
                </h4>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-slate-400 text-sm">0 UPDATES</span>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <p className="text-slate-300 text-sm">
                  No notices right now. Check back later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
