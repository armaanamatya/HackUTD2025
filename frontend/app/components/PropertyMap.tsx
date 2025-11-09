'use client'

import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

interface Property {
  id: string
  title: string
  address: string
  [key: string]: any
}

interface PropertyMapProps {
  property: Property
}

export default function PropertyMap({ property }: PropertyMapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[#1E3028] overflow-hidden h-[180px] relative"
    >
      {/* Mock Map Background with more realistic styling */}
      <div className="w-full h-full bg-gradient-to-br from-[#0B0E0C] via-[#111513] to-[#0B0E0C] relative">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>
        </div>

        {/* Simulated roads/paths */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#64748b" strokeWidth="2" />
          <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#64748b" strokeWidth="2" />
          <line x1="0" y1="30%" x2="70%" y2="30%" stroke="#64748b" strokeWidth="1.5" />
        </svg>

        {/* Main Location Pin - Centered */}
        <motion.div
          initial={{ scale: 0, y: -30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10"
        >
          <div className="relative">
            {/* Pin shadow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-black/20 rounded-full blur-sm" />
            
            {/* Main pin - smaller */}
            <div className="w-9 h-9 bg-[#00A86B] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <MapPin size={18} className="text-white fill-white" />
            </div>
            
            {/* Pulse Animation */}
            <motion.div
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-[#00A86B] rounded-full -z-10"
            />
          </div>
        </motion.div>

        {/* Additional smaller markers */}
        <div className="absolute top-[25%] left-[30%] w-2 h-2 bg-[#00A86B]/60 rounded-full shadow-sm" />
        <div className="absolute top-[65%] left-[65%] w-2 h-2 bg-[#00A86B]/60 rounded-full shadow-sm" />
        <div className="absolute top-[40%] right-[25%] w-2 h-2 bg-[#00A86B]/60 rounded-full shadow-sm" />
        <div className="absolute bottom-[30%] left-[20%] w-2 h-2 bg-[#00A86B]/60 rounded-full shadow-sm" />

        {/* Location Info Card - Bottom - Compacted */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-2 left-2 right-2"
        >
          <div className="bg-[#111513]/95 backdrop-blur-md rounded-lg px-2.5 py-2 shadow-lg border border-[#1E3028]">
            <div className="flex items-center gap-2">
              {/* Small thumbnail */}
              <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-[#1E3028]">
                <img 
                  src={property.image} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white truncate mb-0.5 font-cbre">{property.title}</p>
                <p className="text-[9px] text-[#B7C4B8] truncate">{property.address}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
