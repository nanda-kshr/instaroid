'use client'
import { useState } from 'react'
import Hero from '@/components/Hero'
import Navigation from '@/components/Navigation'
import PolaroidGallery from '@/components/PolaroidGallery'
import CategorySection from '@/components/CategorySection'
import Features from '@/components/Features'
import Testimonials from '@/components/Testimonials'
import CallToAction from '@/components/CallToAction'
import Footer from '@/components/Footer'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  return (
    <main className="min-h-screen">
      {/* Hero Section with Navigation and Polaroid Gallery */}
      <div className="relative">
        <Hero onSlideChange={setCurrentSlide} />
        <Navigation />
        <div className="absolute inset-0 z-20">
          <PolaroidGallery currentTheme={currentSlide} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 bg-white">
        <CategorySection />
        <Features />
        <Testimonials />
        <CallToAction />
        <Footer />
      </div>
    </main>
  )
}