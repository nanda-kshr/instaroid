'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const heroSlides = [
  {
    id: 'jujutsu',
    background: '/hero/jujutsu.svg',
    theme: 'Jujutsu Kaisen',
    gradient: 'from-red-900 via-orange-800 to-yellow-700'
  },
  {
    id: 'cricket',
    background: '/hero/cricket.svg',
    theme: 'Cricket',
    gradient: 'from-green-900 via-blue-800 to-white'
  },
  {
    id: 'actors',
    background: '/hero/actors.svg',
    theme: 'Indian Actors',
    gradient: 'from-purple-900 via-pink-800 to-orange-700'
  },
  {
    id: 'songs',
    background: '/hero/songs.svg',
    theme: 'Songs',
    gradient: 'from-blue-900 via-purple-800 to-pink-700'
  },
  {
    id: 'games',
    background: '/hero/games.svg',
    theme: 'Games',
    gradient: 'from-gray-900 via-red-800 to-purple-700'
  }
]

interface HeroProps {
  onSlideChange?: (slideIndex: number) => void
}

export default function Hero({ onSlideChange }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        onSlideChange?.(currentSlide)
        setIsTransitioning(false)
      }, 500)
    }, 4000)

    return () => clearInterval(interval)
  }, [currentSlide, onSlideChange])

  const currentHero = heroSlides[currentSlide]

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentHero.gradient} transition-all duration-1000`} />
      
      {/* Hero Background Images with Transition */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-110'
          }`}
        >
          <Image
            src={slide.background}
            alt={slide.theme}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 z-10" />
      
      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true)
              setTimeout(() => {
                setCurrentSlide(index)
                onSlideChange?.(index)
                setIsTransitioning(false)
              }, 300)
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Theme Title */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center">
        <h1 className={`text-6xl font-bold text-white mb-4 transition-all duration-500 ${
          isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        }`}>
          {currentHero.theme}
        </h1>
        <p className="text-xl text-white/80">Premium Polaroid Collection</p>
      </div>
    </div>
  )
}
