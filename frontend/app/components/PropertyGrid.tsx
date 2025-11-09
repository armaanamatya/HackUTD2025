'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, BookmarkCheck, MapPin, Star, Bed, Bath, Square } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import PropertyDetailPanel from './PropertyDetailPanel'

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

interface PropertyGridProps {
  properties: Property[]
  filters?: any
}

export default function PropertyGrid({ properties, filters }: PropertyGridProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [activeTab, setActiveTab] = useState<'discover' | 'saved'>('discover')
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('bookmarked-properties') || '{}')
    }
    return {}
  })

  // Sync bookmarked state with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookmarked-properties', JSON.stringify(bookmarked))
    }
  }, [bookmarked])

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setBookmarked((prev) => {
      const updated = {
        ...prev,
        [id]: !prev[id],
      }
      // If unbookmarking in saved tab, clear selection if it was the selected property
      if (!updated[id] && selectedProperty?.id === id) {
        setSelectedProperty(null)
      }
      return updated
    })
  }

  // Mock properties if none provided
  const mockProperties: Property[] = properties.length > 0 ? [] : [
    {
      id: '1',
      title: 'Modern Family Home',
      address: 'Jakarta, Indonesia',
      price: '$2,500/month',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      type: 'Home',
      beds: 4,
      baths: 3,
      sqft: '2,400 sq ft',
      tags: ['Garden', 'Garage', 'Pool'],
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=300&fit=crop',
      ],
      description: '🏡 Beautiful modern family home with spacious living areas, updated kitchen, and stunning backyard. Perfect for families looking for comfort and style.',
      rooms: 6,
      kitchens: 1,
      garage: 2,
    },
    {
      id: '2',
      title: 'Luxury Villa Estate',
      address: 'Bali, Indonesia',
      price: '$4,200/month',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      type: 'Villa',
      beds: 5,
      baths: 4,
      sqft: '3,800 sq ft',
      tags: ['Garden', 'Pool', 'Gym'],
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
      ],
      description: '✨ Stunning luxury villa with panoramic views, infinity pool, and premium finishes throughout. Resort-style living at its finest.',
      rooms: 8,
      kitchens: 2,
      garage: 3,
    },
    {
      id: '3',
      title: 'Downtown Apartment',
      address: 'Jakarta, Indonesia',
      price: '$1,800/month',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      type: 'Apartment',
      beds: 2,
      baths: 2,
      sqft: '1,200 sq ft',
      tags: ['Gym', 'Parking'],
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
      ],
      description: '🏙️ Modern downtown apartment with city views, premium amenities, and walking distance to shopping and dining.',
      rooms: 4,
      kitchens: 1,
      garage: 1,
    },
    {
      id: '4',
      title: 'Cozy Suburban Home',
      address: 'Semarang, Indonesia',
      price: '$1,900/month',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
      type: 'Home',
      beds: 3,
      baths: 2,
      sqft: '1,800 sq ft',
      tags: ['Garden', 'Garage'],
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop',
      ],
      description: '🌳 Charming suburban home in quiet neighborhood. Perfect for families seeking peace and community.',
      rooms: 5,
      kitchens: 1,
      garage: 2,
    },
    {
      id: '5',
      title: 'Beachfront Villa',
      address: 'Bali, Indonesia',
      price: '$5,500/month',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      type: 'Villa',
      beds: 6,
      baths: 5,
      sqft: '4,500 sq ft',
      tags: ['Pool', 'Garden', 'Beach'],
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop',
      ],
      description: '🌊 Exclusive beachfront villa with direct beach access, private pool, and breathtaking ocean views.',
      rooms: 10,
      kitchens: 2,
      garage: 3,
    },
    {
      id: '6',
      title: 'City Loft Studio',
      address: 'Jakarta, Indonesia',
      price: '$1,200/month',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop',
      type: 'Apartment',
      beds: 1,
      baths: 1,
      sqft: '800 sq ft',
      tags: ['Gym', 'Parking'],
      images: [
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=300&fit=crop',
      ],
      description: '🎨 Stylish loft studio perfect for young professionals. Modern design with high ceilings and natural light.',
      rooms: 2,
      kitchens: 1,
      garage: 1,
    },
  ]

  // Extend mock properties for scrolling demonstration
  const allProperties = useMemo(() => {
    if (properties.length > 0) return properties
    const extendedProperties = [
      ...mockProperties,
      ...mockProperties.map((p, i) => ({ ...p, id: `${p.id}-dup-${i}` })),
    ]
    return extendedProperties
  }, [properties, mockProperties])

  // Filter saved properties
  const savedProperties = useMemo(() => {
    return allProperties.filter((p) => bookmarked[p.id])
  }, [allProperties, bookmarked])

  // Determine which properties to display based on active tab
  const displayProperties = useMemo(() => {
    return activeTab === 'saved' ? savedProperties : allProperties
  }, [activeTab, savedProperties, allProperties])

  // Update selected property when switching tabs to ensure it exists in current view
  useEffect(() => {
    if (activeTab === 'saved') {
      if (selectedProperty && !bookmarked[selectedProperty.id]) {
        setSelectedProperty(savedProperties[0] || null)
      } else if (!selectedProperty && savedProperties.length > 0) {
        setSelectedProperty(savedProperties[0])
      }
    }
  }, [activeTab, bookmarked, selectedProperty, savedProperties])

  return (
    <div className="flex-1 flex gap-6 overflow-hidden h-full">
      {/* Center: Property Grid - Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 pb-4 border-b border-[#1E3028]">
          <h2 className="text-2xl font-bold text-white font-cbre mb-4">Property Discovery</h2>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <motion.button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'discover'
                  ? 'bg-[#00A86B] text-white shadow-[0_0_10px_rgba(0,168,107,0.3)]'
                  : 'bg-[#111513]/60 text-[#B7C4B8] hover:text-white hover:bg-[#111513]/80 border border-[#1E3028]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Discover
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'saved'
                  ? 'bg-[#00A86B] text-white shadow-[0_0_10px_rgba(0,168,107,0.3)]'
                  : 'bg-[#111513]/60 text-[#B7C4B8] hover:text-white hover:bg-[#111513]/80 border border-[#1E3028]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Saved
              {savedProperties.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                  {savedProperties.length}
                </span>
              )}
            </motion.button>
          </div>
          
          <p className="text-sm text-[#B7C4B8]">
            {activeTab === 'saved' 
              ? `${savedProperties.length} saved ${savedProperties.length === 1 ? 'property' : 'properties'}`
              : `Found ${displayProperties.length} properties matching your criteria`
            }
          </p>
        </div>
        
        {/* Scrollable Property Cards */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'saved' && savedProperties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-20 h-20 rounded-full bg-[#00A86B]/10 border border-[#00A86B]/20 flex items-center justify-center mb-4">
                <Bookmark size={32} className="text-[#00A86B]" />
              </div>
              <h3 className="text-xl font-semibold text-white font-cbre mb-2">No saved properties yet</h3>
              <p className="text-[#B7C4B8] max-w-md">
                You haven't saved any properties yet. Start exploring and bookmark your favorites!
              </p>
              <motion.button
                onClick={() => setActiveTab('discover')}
                className="mt-6 px-6 py-3 rounded-lg bg-[#00A86B] text-white font-medium hover:bg-[#88C999] transition-colors shadow-[0_0_10px_rgba(0,168,107,0.3)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Properties
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-6 auto-rows-max"
              >
                {displayProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.03 }}
              onClick={() => setSelectedProperty(property)}
              className={`relative bg-[#111513]/60 backdrop-blur-xl rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] border-2 cursor-pointer transition-all duration-200 ${
                selectedProperty?.id === property.id ? 'border-[#00A86B] ring-2 ring-[#00A86B]/30' : 'border-[#1E3028] hover:border-[#00A86B]/50'
              }`}
            >
              {/* Image */}
              <div className="relative w-full h-[160px] overflow-hidden rounded-t-2xl">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {/* Badge */}
                <div className="absolute top-3 left-3 bg-[#111513]/95 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-[#1E3028]">
                  {property.type}
                </div>
                {/* Bookmark */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 p-2 bg-[#111513]/95 backdrop-blur-sm rounded-full shadow-sm transition-colors border border-[#1E3028] group"
                  onClick={(e) => toggleBookmark(property.id, e)}
                  title={bookmarked[property.id] ? 'Remove bookmark' : 'Save property'}
                >
                  <AnimatePresence mode="wait">
                    {bookmarked[property.id] ? (
                      <motion.div
                        key="bookmarked"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BookmarkCheck size={16} className="text-[#00A86B]" fill="#00A86B" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="not-bookmarked"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Bookmark size={16} className="text-[#B7C4B8] group-hover:text-[#00A86B] transition-colors" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-base font-semibold text-white mb-1 truncate font-cbre">{property.title}</h3>
                <p className="text-xs text-[#B7C4B8] flex items-center gap-1 mb-3">
                  <MapPin size={12} /> {property.address}
                </p>

                {/* Price & Rating */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-white font-cbre">{property.price}</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-[#88C999] fill-[#88C999]" />
                    <span className="text-sm text-[#B7C4B8] font-medium">{property.rating}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {property.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-xs text-[#C9E3D5] bg-[#111513]/40 border border-[#1E3028] px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-[#B7C4B8] text-xs">
                  <div className="flex items-center gap-1">
                    <Bed size={14} /> {property.beds}
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath size={14} /> {property.baths}
                  </div>
                  <div className="flex items-center gap-1">
                    <Square size={14} /> {property.sqft.split(' ')[0]}
                  </div>
                </div>
              </div>
            </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Right: Property Details + Map - Fixed */}
      <div className="w-[380px] flex-shrink-0 h-full overflow-hidden">
        <PropertyDetailPanel 
          property={selectedProperty || displayProperties[0]} 
          allProperties={displayProperties}
          selectedPropertyId={selectedProperty?.id}
        />
      </div>
    </div>
  )
}
