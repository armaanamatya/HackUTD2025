'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamically import MapContainer and related components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface Property {
  id: string
  title: string
  address: string
  price: string
  image: string
  lat?: number
  lng?: number
  [key: string]: any
}

interface PropertyMapProps {
  property: Property
  properties?: Property[]
  selectedPropertyId?: string
}

// Component to center map on selected property
function MapCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const { useMap } = require('react-leaflet')
  const map = useMap()
  
  useEffect(() => {
    if (map) {
      map.setView(center, zoom, { animate: true, duration: 0.5 })
    }
  }, [map, center, zoom])
  
  return null
}

// Create custom animated green pin icon
const createCustomIcon = (isSelected: boolean = false, uniqueId: string = '') => {
  if (typeof window === 'undefined') return null
  
  const L = require('leaflet')
  const iconSize = isSelected ? 32 : 24
  // Ensure uniqueId is a string and sanitize it for use in SVG IDs
  const sanitizedId = (uniqueId || '').toString().replace(/[^a-zA-Z0-9]/g, '-')
  const filterId = `glow-${sanitizedId || 'default'}`
  
  // Create SVG for the marker with unique IDs to avoid conflicts
  const svg = `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 ${iconSize} ${iconSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="${filterId}">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <style>
          @keyframes pulse-${filterId} {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          .pulse-circle-${filterId} {
            animation: pulse-${filterId} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        </style>
      </defs>
      <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="${iconSize / 2 - 2}" fill="#22c55e" filter="url(#${filterId})" class="pulse-circle-${filterId}" opacity="0.9"/>
      <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="${iconSize / 3}" fill="#4ade80" opacity="0.8"/>
      <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="${iconSize / 6}" fill="#ffffff"/>
    </svg>
  `
  
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize],
  })
}

// Default coordinates for Jakarta, Indonesia (fallback)
const DEFAULT_COORDS: [number, number] = [-6.2088, 106.8456]

// Generate coordinates based on property address/index (mock data)
const getPropertyCoordinates = (property: Property, index: number): [number, number] => {
  if (property.lat && property.lng) {
    return [property.lat, property.lng]
  }
  
  // Generate mock coordinates around Jakarta with slight variations
  const baseLat = -6.2088
  const baseLng = 106.8456
  const latOffset = (index % 3) * 0.05 - 0.05
  const lngOffset = (Math.floor(index / 3) % 2) * 0.05 - 0.025
  
  return [baseLat + latOffset, baseLng + lngOffset]
}

export default function PropertyMap({ property, properties = [], selectedPropertyId }: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Ensure we're on client side and Leaflet CSS is loaded
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      // Fix Leaflet default icon issue
      import('leaflet').then((L) => {
        delete (L.default.Icon.Default.prototype as any)._getIconUrl
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
      })
    }
  }, [])

  // Get coordinates for the main property
  const propertyIndex = properties.length > 0 
    ? properties.findIndex(p => p.id === property.id) 
    : 0
  const safeIndex = propertyIndex >= 0 ? propertyIndex : 0
  const propertyCoords = getPropertyCoordinates(property, safeIndex)
  
  // Get all properties with coordinates
  const propertiesWithCoords = useMemo(() => {
    if (properties.length > 0) {
      return properties.map((p, idx) => ({
        ...p,
        coords: getPropertyCoordinates(p, idx),
      }))
    }
    return [{
      ...property,
      coords: propertyCoords,
    }]
  }, [properties, property, propertyCoords])

  // Determine center position (prioritize selected property)
  const centerPosition = useMemo(() => {
    if (selectedPropertyId) {
      const selected = propertiesWithCoords.find(p => p.id === selectedPropertyId)
      if (selected) return selected.coords
    }
    return propertyCoords
  }, [selectedPropertyId, propertiesWithCoords, propertyCoords])

  if (!isMounted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[#1E3028] overflow-hidden h-[300px] relative flex items-center justify-center"
      >
        <div className="text-[#B7C4B8] text-sm">Loading map...</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[#1E3028] overflow-hidden h-[300px] relative"
    >
      <MapContainer
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        className="dark-map"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        
        <MapCenter center={centerPosition} zoom={13} />
        
        {propertiesWithCoords.map((prop) => {
          const isSelected = selectedPropertyId 
            ? prop.id === selectedPropertyId 
            : prop.id === property.id
          const customIcon = createCustomIcon(isSelected, prop.id)
          if (!customIcon) return null
          
          return (
            <Marker
              key={prop.id}
              position={prop.coords}
              icon={customIcon}
            >
              <Popup
                className="custom-popup"
                closeButton={true}
              >
                <div className="text-sm text-white min-w-[200px]">
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className="rounded-md mb-2 w-full h-24 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x120/111513/B7C4B8?text=Property'
                    }}
                  />
                  <strong className="text-base font-semibold text-white font-cbre block mb-1">
                    {prop.title}
                  </strong>
                  <p className="text-[#B7C4B8] text-xs mt-1 mb-2">{prop.address}</p>
                  <p className="text-[#00A86B] font-semibold text-sm">{prop.price}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </motion.div>
  )
}
