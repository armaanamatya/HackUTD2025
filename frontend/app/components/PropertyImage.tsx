'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PropertyImageProps {
  src: string | null | undefined
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  width?: number
  height?: number
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop'

export default function PropertyImage({ 
  src, 
  alt, 
  fill = false,
  className = 'object-cover',
  sizes,
  width,
  height
}: PropertyImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(FALLBACK_IMAGE)
    }
  }

  // Check if it's an external URL
  const isExternal = imgSrc?.startsWith('http://') || imgSrc?.startsWith('https://')

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
        unoptimized={isExternal}
        onError={handleError}
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 600}
      height={height || 400}
      className={className}
      sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
      unoptimized={isExternal}
      onError={handleError}
    />
  )
}

