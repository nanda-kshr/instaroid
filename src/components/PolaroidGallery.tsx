'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type ThemeKey = 'jujutsu' | 'cricket' | 'actors' | 'songs' | 'games'

interface Polaroid {
  id: number
  image: string
  price: string
}

const polaroidData: Record<ThemeKey, Polaroid[]> = {
  jujutsu: [
    {
      id: 1,
      image: '/polaroids/jujutsu/1.png',
      price: '$29.99'
    },
    {
      id: 2,
      image: '/polaroids/jujutsu/2.png',
      price: '$29.99'
    },
    {
      id: 3,
      image: '/polaroids/jujutsu/3.png',
      price: '$29.99'
    },
    {
      id: 4,
      image: '/polaroids/jujutsu/4.png',
      price: '$29.99'
    }
  ],
  cricket: [
    {
      id: 1,
      image: '/top/1.png',
      price: '$24.99'
    },
    {
      id: 2,
      image: '/top/2.png',
      price: '$24.99'
    },
    {
      id: 3,
      image: '/top/3.png',
      price: '$24.99'
    },
    {
      id: 4,
      image: '/top/4.png',
      price: '$24.99'
    }
  ],
  actors: [
    {
      id: 1,
      image: '/top/1.png',
      price: '$34.99'
    },
    {
      id: 2,
      image: '/top/2.png',
      price: '$34.99'
    },
    {
      id: 3,
      image: '/top/3.png',
      price: '$34.99'
    },
    {
      id: 4,
      image: '/top/4.png',
      price: '$34.99'
    }
  ],
  songs: [
    {
      id: 1,
      image: '/top/1.png',
      price: '$19.99'
    },
    {
      id: 2,
      image: '/top/2.png',
      price: '$19.99'
    },
    {
      id: 3,
      image: '/top/3.png',
      price: '$19.99'
    },
    {
      id: 4,
      image: '/top/4.png',
      price: '$19.99'
    }
  ],
  games: [
    {
      id: 1,
      image: '/top/1.png',
      price: '$39.99'
    },
    {
      id: 2,
      image: '/top/2.png',
      price: '$39.99'
    },
    {
      id: 3,
      image: '/top/3.png',
      price: '$39.99'
    },
    {
      id: 4,
      image: '/top/4.png',
      price: '$39.99'
    }
  ]
}

// Different configurations for 3D depth effect
const cardConfigs = [
  { 
    position: 'top-24 left-1/4',
    rotation: '-3deg',
    delay: 0,
    sizeMultiplier: 0.8,
    zIndex: 10,
    shadowDirection: 'right-bottom'
  },
  { 
    position: 'top-12 right-1/4',
    rotation: '2deg',
    delay: 200,
    sizeMultiplier: 1.0,
    zIndex: 15,
    shadowDirection: 'left-bottom'
  },
  { 
    position: 'bottom-20 right-16',
    rotation: '-2deg',
    delay: 400,
    sizeMultiplier: 1.3,
    zIndex: 20,
    shadowDirection: 'left-bottom'
  },
  { 
    position: 'bottom-32 left-16',
    rotation: '3deg',
    delay: 600,
    sizeMultiplier: 0.9,
    zIndex: 12,
    shadowDirection: 'right-bottom'
  }
]

interface ImageDimensions {
  width: number
  height: number
}

interface PolaroidCardProps {
  polaroid: Polaroid
  config: { 
    position: string
    rotation: string
    delay: number
    sizeMultiplier: number
    zIndex: number
    shadowDirection: string
  }
  isAnimating: boolean
  index: number
}

function PolaroidCard({ polaroid, config, isAnimating, index }: PolaroidCardProps) {
  const [dimensions, setDimensions] = useState<ImageDimensions>({ width: 280, height: 350 })
  const imgRef = useRef<HTMLImageElement>(null)

  const handleImageLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current
      
      const baseMaxWidth = 280
      const baseMaxHeight = 350
      const baseMinWidth = 220
      const baseMinHeight = 280
      
      const maxWidth = Math.round(baseMaxWidth * config.sizeMultiplier)
      const maxHeight = Math.round(baseMaxHeight * config.sizeMultiplier)
      const minWidth = Math.round(baseMinWidth * config.sizeMultiplier)
      const minHeight = Math.round(baseMinHeight * config.sizeMultiplier)
      
      let scaledWidth = naturalWidth
      let scaledHeight = naturalHeight
      
      if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
        const widthRatio = maxWidth / naturalWidth
        const heightRatio = maxHeight / naturalHeight
        const ratio = Math.min(widthRatio, heightRatio)
        
        scaledWidth = naturalWidth * ratio
        scaledHeight = naturalHeight * ratio
      }
      
      if (scaledWidth < minWidth) {
        const ratio = minWidth / scaledWidth
        scaledWidth = minWidth
        scaledHeight = scaledHeight * ratio
      }
      
      if (scaledHeight < minHeight) {
        const ratio = minHeight / scaledHeight
        scaledHeight = minHeight
        scaledWidth = scaledWidth * ratio
      }
      
      setDimensions({
        width: Math.round(scaledWidth),
        height: Math.round(scaledHeight)
      })
    }
  }

  const getShadowOffset = () => {
    const baseOffset = Math.round(8 * config.sizeMultiplier)
    const shadowBlur = Math.round(20 * config.sizeMultiplier)
    const shadowSpread = Math.round(5 * config.sizeMultiplier)
    
    switch (config.shadowDirection) {
      case 'right-bottom':
        return `${baseOffset}px ${baseOffset}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, 0.4)`
      case 'left-bottom':
        return `-${baseOffset}px ${baseOffset}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, 0.4)`
      case 'right-top':
        return `${baseOffset}px -${baseOffset}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, 0.4)`
      case 'left-top':
        return `-${baseOffset}px -${baseOffset}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, 0.4)`
      default:
        return `${baseOffset}px ${baseOffset}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, 0.4)`
    }
  }

  return (
    <div
      className={`absolute ${config.position} transition-all duration-500 ease-in-out`}
      style={{ 
        transform: `rotate(${config.rotation})`,
        zIndex: isAnimating ? config.zIndex + 20 : config.zIndex,
        boxShadow: getShadowOffset()
      }}
    >
      <div
        className="bg-white p-4 transition-all duration-500 hover:scale-105 cursor-pointer"
        style={{
          width: dimensions.width,
          height: dimensions.height
        }}
      >
        <div className="relative w-full h-[calc(100%-40px)]">
          <Image
            ref={imgRef}
            src={polaroid.image}
            alt={`Polaroid ${polaroid.id}`}
            fill
            className="object-cover"
            onLoad={handleImageLoad}
            priority={index === 0}
          />
        </div>
        <div className="h-10 flex items-center justify-between px-2">
          <span className="text-sm text-gray-600">#{polaroid.id}</span>
          <span className="text-sm font-semibold text-gray-800">{polaroid.price}</span>
        </div>
      </div>
    </div>
  )
}

interface PolaroidGalleryProps {
  currentTheme?: number
}

export default function PolaroidGallery({ currentTheme = 0 }: PolaroidGalleryProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const themeKeys = Object.keys(polaroidData) as ThemeKey[]
  const currentThemeKey = themeKeys[currentTheme % themeKeys.length]

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [currentTheme])

  return (
    <div className="relative w-full h-full">
      {polaroidData[currentThemeKey].map((polaroid, index) => (
        <PolaroidCard
          key={`${currentThemeKey}-${polaroid.id}`}
          polaroid={polaroid}
          config={cardConfigs[index]}
          isAnimating={isAnimating}
          index={index}
        />
      ))}
    </div>
  )
}