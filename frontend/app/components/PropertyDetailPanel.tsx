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
  allProperties?: Property[]
  selectedPropertyId?: string
}

export default function PropertyDetailPanel({ property, allProperties, selectedPropertyId }: PropertyDetailPanelProps) {
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
      className="h-full flex flex-col gap-3 p-3 overflow-y-auto custom-scrollbar"
    >
      {/* Property Details Card - Compacted */}
      <div className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[#1E3028] overflow-visible">
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
          <h2 className="text-base font-bold text-white mb-0.5 leading-tight font-cbre">{property.title}</h2>
          <p className="text-[10px] text-[#B7C4B8] mb-2.5">📍 {property.address}</p>
          
          {/* Price and Rating */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-white font-cbre">{property.price}</span>
              <span className="text-xs text-[#B7C4B8]">/month</span>
            </div>
            <div className="flex items-center gap-1 bg-[#00A86B]/10 border border-[#00A86B]/40 px-2 py-0.5 rounded-lg">
              <span className="text-[#88C999] text-xs">★</span>
              <span className="text-xs font-semibold text-[#B7C4B8]">{property.rating}</span>
            </div>
          </div>

          {/* Tabs - Compacted */}
          <div className="flex gap-6 mb-3 border-b border-[#1E3028]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-xs font-medium transition-colors relative ${
                  activeTab === tab.id ? 'text-[#00A86B]' : 'text-[#B7C4B8] hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A86B] rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Description Section - Compacted */}
          <div className="mb-3">
            <h3 className="text-[10px] font-semibold text-white uppercase tracking-wide mb-1.5 font-cbre">Description :</h3>
            <p className="text-[10px] text-[#C9E3D5] leading-relaxed line-clamp-2">
              {property.description || '🏡 Welcome to Midnight Ridge Villa! Experience a peaceful escape at Midnight Ridge Villa, a modern retreat set on a quiet hillside with stunning views of valleys and starry nights.'}
            </p>
          </div>

          {/* Property Attributes - Pill Style */}
          <div className="flex flex-wrap gap-2 mb-4">
            {specs.map((spec, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111513]/40 border border-[#1E3028] text-[#C9E3D5] text-xs font-medium shadow-sm hover:bg-[#00A86B]/10 hover:border-[#00A86B]/40 transition-all cursor-default"
              >
                <spec.icon className="w-3.5 h-3.5 text-[#00A86B]" />
                <span className="font-semibold text-white">{spec.value}</span>
                <span className="text-[#B7C4B8] text-[10px]">{spec.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons - Compacted */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-3 py-2 rounded-lg border-2 border-[#00A86B] text-[#00A86B] font-semibold text-xs hover:bg-[#00A86B]/10 transition-all"
            >
              Contact Agent
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-3 py-2 rounded-lg bg-[#00A86B] text-white font-semibold text-xs hover:bg-[#88C999] transition-all shadow-[0_0_10px_rgba(0,168,107,0.3)]"
            >
              Order Now
            </motion.button>
          </div>
        </div>
      </div>

      {/* Map - Compacted */}
      <PropertyMap 
        property={property} 
        properties={allProperties || [property]}
        selectedPropertyId={selectedPropertyId || property.id}
      />
    </motion.div>
  )
}
