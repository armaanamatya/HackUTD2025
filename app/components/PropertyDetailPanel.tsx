'use client'

import { motion } from 'framer-motion'
import { Home, Bed, Bath, Square, Car, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import PropertyMap from './PropertyMap'

interface Property {
  id: string
  title: string
  address: string
  price: string
  rating: number
  image: string
  type: string
  beds: number
  baths: number
  sqft: string
  tags: string[]
  images?: string[]
  description?: string
  rooms?: number
  kitchens?: number
  garage?: number
}

interface PropertyDetailPanelProps {
  property: Property
}

export default function PropertyDetailPanel({ property }: PropertyDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'about'>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'about', label: 'About' },
  ] as const

  const specs = [
    { icon: Home, label: 'Rooms', value: property.rooms || 6 },
    { icon: Bed, label: 'Beds', value: property.beds },
    { icon: Bath, label: 'Baths', value: property.baths },
    { icon: UtensilsCrossed, label: 'Kitchens', value: property.kitchens || 2 },
    { icon: Square, label: 'Area', value: property.sqft },
    { icon: Car, label: 'Garage', value: property.garage || 1 },
  ]

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[380px] flex-shrink-0 flex flex-col gap-3 p-3 overflow-y-auto"
    >
      {/* Property Details Card - Compacted */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-visible">
        {/* Image Gallery - Smaller */}
        <div className="grid grid-cols-[2fr_1fr] gap-1.5 p-2.5">
          {/* Main large image */}
          <div className="relative h-[140px] rounded-lg overflow-hidden col-span-1 row-span-2">
            <img 
              src={(property.images && property.images[0]) || property.image} 
              alt={property.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          {/* Two smaller images stacked */}
          <div className="relative h-[68px] rounded-lg overflow-hidden">
            <img 
              src={(property.images && property.images[1]) || property.image} 
              alt={`${property.title} 2`} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="relative h-[68px] rounded-lg overflow-hidden">
            <img 
              src={(property.images && property.images[2]) || property.image} 
              alt={`${property.title} 3`} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Property Info - Compacted */}
        <div className="px-4 pb-4">
          {/* Title and Location */}
          <h2 className="text-base font-bold text-gray-900 mb-0.5 leading-tight">{property.title}</h2>
          <p className="text-[10px] text-gray-400 mb-2.5">📍 {property.address}</p>
          
          {/* Price and Rating */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-gray-900">{property.price}</span>
              <span className="text-xs text-gray-500">/month</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-lg">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-xs font-semibold text-gray-700">{property.rating}</span>
            </div>
          </div>

          {/* Tabs - Compacted */}
          <div className="flex gap-6 mb-3 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-xs font-medium transition-colors relative ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Description Section - Compacted */}
          <div className="mb-3">
            <h3 className="text-[10px] font-semibold text-gray-900 uppercase tracking-wide mb-1.5">Description :</h3>
            <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-2">
              {property.description || '🏡 Welcome to Midnight Ridge Villa! Experience a peaceful escape at Midnight Ridge Villa, a modern retreat set on a quiet hillside with stunning views of valleys and starry nights.'}
            </p>
          </div>

          {/* Property Attributes - Pill Style */}
          <div className="flex flex-wrap gap-2 mb-4">
            {specs.map((spec, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium shadow-sm hover:bg-gray-200 transition-all cursor-default"
              >
                <spec.icon className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-semibold text-gray-900">{spec.value}</span>
                <span className="text-gray-500 text-[10px]">{spec.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons - Compacted */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-3 py-2 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold text-xs hover:bg-blue-50 transition-all"
            >
              Contact Agent
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-all shadow-md"
            >
              Order Now
            </motion.button>
          </div>
        </div>
      </div>

      {/* Map - Compacted */}
      <PropertyMap property={property} />
    </motion.div>
  )
}
