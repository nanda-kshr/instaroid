'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageWithDimensionsProps {
  src: string
  alt: string
  className?: string
  onDimensionsChange?: (width: number, height: number) => void
}

export default function ImageWithDimensions({ 
  src, 
  alt, 
  className = '',
  onDimensionsChange 
}: ImageWithDimensionsProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current
      
      // Scale down large images while maintaining aspect ratio
      const maxWidth = 300
      const maxHeight = 360
      
      let scaledWidth = naturalWidth
      let scaledHeight = naturalHeight
      
      if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
        const widthRatio = maxWidth / naturalWidth
        const heightRatio = maxHeight / naturalHeight
        const ratio = Math.min(widthRatio, heightRatio)
        
        scaledWidth = naturalWidth * ratio
        scaledHeight = naturalHeight * ratio
      }
      
      const finalDimensions = {
        width: Math.round(scaledWidth),
        height: Math.round(scaledHeight)
      }
      
      setDimensions(finalDimensions)
      setIsLoaded(true)
      onDimensionsChange?.(finalDimensions.width, finalDimensions.height)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-200 animate-pulse" 
           style={{ width: '200px', height: '240px' }}>
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          fill
          className={`object-cover ${className}`}
          onLoad={handleLoad}
          style={{ opacity: 0 }}
        />
      </div>
    )
  }

  return (
    <div style={{ width: dimensions.width, height: dimensions.height }}>
      <Image
        src={src}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className={`object-cover ${className}`}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}