import { Calendar, Clock, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { ASSET_PATHS } from '@/shared/constants/routes'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0">
          <Image
            src={`${ASSET_PATHS.IMAGES}/volleyball.png`}
            alt="Volleyball Court"
            className="w-full h-full object-cover"
            fill
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Streamline Your
                <span className="block text-primary">Volleyball Court Bookings</span>
              </h1>
              <p className="mt-6 text-xl text-gray-300 max-w-3xl">
                Effortlessly manage and book volleyball courts. Whether it&apos;s indoor or beach
                volleyball, we&apos;ve got your game time covered.
              </p>

              <div className="mt-10 flex gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Get Started
                </Link>
                <Link
                  href="/signin"
                  className="px-8 py-3 border border-gray-400 text-white rounded-lg font-semibold hover:border-primary transition"
                >
                  Sign In
                </Link>
              </div>

              {/* Features */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  <span className="text-gray-300">Real-time Availability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-primary" />
                  <span className="text-gray-300">24/7 Booking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-primary" />
                  <span className="text-gray-300">Secure Payments</span>
                </div>
              </div>
            </div>

            {/* Feature Card */}
            <div className="mt-12 lg:mt-0 lg:col-span-5">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Everything You Need for Volleyball
                </h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    Flexible court scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    Equipment rentals available
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    Adjustable net heights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    Indoor & outdoor courts
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
