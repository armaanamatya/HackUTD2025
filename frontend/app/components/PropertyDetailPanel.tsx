'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Home, Bed, Bath, Square, Car, UtensilsCrossed, X, Mail, Phone, MessageSquare, Star, User } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Property {
  id: string
  title: string
  address: string
  price: string
  rating: number
  image: string
  type: string
  beds: number | null
  baths: number | null
  sqft: string
  tags: string[]
  images?: string[]
  description?: string
  rooms?: number | null
  kitchens?: number | null
  garage?: number | null
  lat?: number
  lng?: number
}

interface PropertyDetailPanelProps {
  property: Property | undefined | null
}

// Contact Modal Component
function ContactModal({ property, isOpen, onClose }: { property: Property; isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert(`Thank you ${formData.name}! Your message has been sent to the agent for ${property.title}.`)
    setFormData({ name: '', email: '', message: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111513] border border-[#1E3028] rounded-2xl p-6 max-w-md w-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white font-cbre">Contact Agent</h3>
            <button
              onClick={onClose}
              className="text-[#B7C4B8] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-[#0B0E0C]/60 rounded-lg border border-[#1E3028]">
            <p className="text-sm text-[#C9E3D5] font-semibold mb-1">{property.title}</p>
            <p className="text-xs text-[#B7C4B8]">{property.address}</p>
            <p className="text-sm text-[#00A86B] font-semibold mt-1">{property.price}/month</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#B7C4B8] mb-1.5">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-[#0B0E0C] border border-[#1E3028] rounded-lg text-white text-sm focus:outline-none focus:border-[#00A86B] transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-[#B7C4B8] mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 bg-[#0B0E0C] border border-[#1E3028] rounded-lg text-white text-sm focus:outline-none focus:border-[#00A86B] transition-colors"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-[#B7C4B8] mb-1.5">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className="w-full px-3 py-2 bg-[#0B0E0C] border border-[#1E3028] rounded-lg text-white text-sm focus:outline-none focus:border-[#00A86B] transition-colors resize-none"
                placeholder="I'm interested in this property..."
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-2.5 bg-[#00A86B] text-white font-semibold rounded-lg hover:bg-[#88C999] transition-all shadow-[0_0_10px_rgba(0,168,107,0.3)]"
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Order Confirmation Modal Component
function OrderModal({ property, isOpen, onClose }: { property: Property; isOpen: boolean; onClose: () => void }) {
  const handleConfirm = () => {
    alert(`Order confirmed for ${property.title}! You will receive a confirmation email shortly.`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111513] border border-[#1E3028] rounded-2xl p-6 max-w-md w-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white font-cbre">Confirm Booking</h3>
            <button
              onClick={onClose}
              className="text-[#B7C4B8] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#0B0E0C]/60 rounded-lg border border-[#1E3028]">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h4 className="text-lg font-semibold text-white font-cbre mb-1">{property.title}</h4>
              <p className="text-xs text-[#B7C4B8] mb-2">{property.address}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#B7C4B8]">Price:</span>
                <span className="text-lg font-bold text-[#00A86B]">{property.price}/month</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#B7C4B8]">
                <span>Property Type:</span>
                <span className="text-white">{property.type}</span>
              </div>
              <div className="flex justify-between text-[#B7C4B8]">
                <span>Bedrooms:</span>
                <span className="text-white">{property.beds}</span>
              </div>
              <div className="flex justify-between text-[#B7C4B8]">
                <span>Bathrooms:</span>
                <span className="text-white">{property.baths}</span>
              </div>
              <div className="flex justify-between text-[#B7C4B8]">
                <span>Area:</span>
                <span className="text-white">{property.sqft}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2.5 border-2 border-[#1E3028] text-[#B7C4B8] font-semibold rounded-lg hover:border-[#00A86B]/40 hover:text-white transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2.5 bg-[#00A86B] text-white font-semibold rounded-lg hover:bg-[#88C999] transition-all shadow-[0_0_10px_rgba(0,168,107,0.3)]"
              >
                Confirm Order
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function PropertyDetailPanel({ property }: PropertyDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'about'>('overview')
  const [showContactModal, setShowContactModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)

  // Extract property ID to satisfy ESLint exhaustive-deps rule
  // Use optional chaining and provide a fallback to avoid errors
  const propertyId = property?.id

  // Reset tab when property changes
  useEffect(() => {
    if (property) {
      setActiveTab('overview')
    }
  }, [propertyId, property])

  // Define tabs - these are constant and don't depend on property
  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'reviews' as const, label: 'Reviews' },
    { id: 'about' as const, label: 'About' },
  ]

  // Define specs with safe property access - show 'N/A' for null/undefined values
  const formatValue = (value: any): string | number => {
    if (value === null || value === undefined) return 'N/A'
    return value
  }
  
  const specs = property ? [
    { icon: Home, label: 'Rooms', value: formatValue(property.rooms) },
    { icon: Bed, label: 'Beds', value: formatValue(property.beds) },
    { icon: Bath, label: 'Baths', value: formatValue(property.baths) },
    { icon: UtensilsCrossed, label: 'Kitchens', value: formatValue(property.kitchens) },
    { icon: Square, label: 'Area', value: property.sqft || 'N/A' },
    { icon: Car, label: 'Garage', value: formatValue(property.garage) },
  ] : []

  // Mock reviews data - constant, doesn't depend on property
  const reviews = [
    {
      id: 1,
      author: 'Sarah Johnson',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Absolutely stunning property! The location is perfect and the amenities are top-notch. Highly recommend!',
    },
    {
      id: 2,
      author: 'Michael Chen',
      rating: 4,
      date: '1 month ago',
      comment: 'Great place to stay. Clean, modern, and well-maintained. The only minor issue was the parking space.',
    },
    {
      id: 3,
      author: 'Emily Rodriguez',
      rating: 5,
      date: '2 months ago',
      comment: 'Perfect for families! Spacious rooms and beautiful views. The property management was very responsive.',
    },
  ]

  // Render empty state if no property, otherwise render property details
  // This early return happens AFTER all hooks are called
  if (!property) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[#B7C4B8] text-sm">No property selected</p>
          <p className="text-[#B7C4B8] text-xs mt-2">Select a property to view details</p>
        </div>
      </div>
    )
  }

  // From this point on, property is guaranteed to be non-null
  // Define content components here since we know property exists

  // Overview Content
  const OverviewContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="overview"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-3">
          <h3 className="text-[10px] font-semibold text-white uppercase tracking-wide mb-1.5 font-cbre">Description</h3>
          <p className="text-[10px] text-[#C9E3D5] leading-relaxed">
            {property.description || '🏡 Welcome to Midnight Ridge Villa! Experience a peaceful escape at Midnight Ridge Villa, a modern retreat set on a quiet hillside with stunning views of valleys and starry nights.'}
          </p>
        </div>

        <div className="mb-3">
          <h3 className="text-[10px] font-semibold text-white uppercase tracking-wide mb-1.5 font-cbre">Property Attributes</h3>
          <div className="flex flex-wrap gap-2">
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
        </div>

        {property.tags && property.tags.length > 0 && (
          <div>
            <h3 className="text-[10px] font-semibold text-white uppercase tracking-wide mb-1.5 font-cbre">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-[#00A86B]/10 border border-[#00A86B]/30 text-[#00A86B] text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )

  // Reviews Content
  const ReviewsContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="reviews"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2"
      >
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-[#00A86B]" fill="#00A86B" />
          <span className="text-sm font-semibold text-white">
            {property.rating} · {reviews.length} Reviews
          </span>
        </div>
        {reviews.map((review) => (
          <div key={review.id} className="p-3 bg-[#0B0E0C]/40 rounded-lg border border-[#1E3028]">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00A86B]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#00A86B]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{review.author}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < review.rating ? 'text-[#00A86B] fill-[#00A86B]' : 'text-[#1E3028]'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#B7C4B8]">{review.date}</span>
            </div>
            <p className="text-[10px] text-[#C9E3D5] leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  )

  // About Content
  const AboutContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="about"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        <div>
          <h3 className="text-[10px] font-semibold text-white uppercase tracking-wide mb-1.5 font-cbre">Property Details</h3>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#B7C4B8]">Property ID:</span>
              <span className="text-white font-medium">#{property.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B7C4B8]">Type:</span>
              <span className="text-white font-medium">{property.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B7C4B8]">Year Built:</span>
              <span className="text-white font-medium">2020</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B7C4B8]">Status:</span>
              <span className="text-[#00A86B] font-medium">Available</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-semibold text-white uppercase tracking-wide mb-1.5 font-cbre">Location</h3>
          <p className="text-[10px] text-[#C9E3D5] leading-relaxed mb-2">{property.address}</p>
          <div className="p-2 bg-[#0B0E0C]/40 rounded-lg border border-[#1E3028]">
            <p className="text-[10px] text-[#B7C4B8]">
              Located in a prime area with easy access to shopping centers, schools, and public transportation. 
              The neighborhood is safe and family-friendly with excellent amenities nearby.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-semibold text-white uppercase tracking-wide mb-1.5 font-cbre">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-[#C9E3D5]">
              <Phone className="w-3.5 h-3.5 text-[#00A86B]" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#C9E3D5]">
              <Mail className="w-3.5 h-3.5 text-[#00A86B]" />
              <span>agent@cura-realestate.com</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
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

            {/* Tabs - Working with proper content */}
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

            {/* Tab Content */}
            <div className="min-h-[120px]">
              {activeTab === 'overview' && <OverviewContent />}
              {activeTab === 'reviews' && <ReviewsContent />}
              {activeTab === 'about' && <AboutContent />}
            </div>

            {/* Action Buttons - Functional */}
            <div className="flex gap-2 mt-4">
              <motion.button
                onClick={() => setShowContactModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-3 py-2 rounded-lg border-2 border-[#00A86B] text-[#00A86B] font-semibold text-xs hover:bg-[#00A86B]/10 transition-all"
              >
                Contact Agent
              </motion.button>
              <motion.button
                onClick={() => setShowOrderModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-3 py-2 rounded-lg bg-[#00A86B] text-white font-semibold text-xs hover:bg-[#88C999] transition-all shadow-[0_0_10px_rgba(0,168,107,0.3)]"
              >
                Order Now
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <ContactModal property={property} isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
      <OrderModal property={property} isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} />
    </>
  )
}
