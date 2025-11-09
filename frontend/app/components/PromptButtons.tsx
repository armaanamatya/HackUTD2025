'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PromptButtonsProps {
  onPromptSelect: (prompt: string, category: 'insights' | 'trends' | 'property' | 'analytics') => void
  onRefresh?: () => void
}

// Prompt categories focused on property discovery, analytics, and insights (no document/OCR mentions)
const promptCategories = {
  property: [
    "Discover high-value properties in your area",
    "Show me top-performing listings in Dallas",
    "Find properties under $500k in Austin",
    "Which properties have the best ROI?",
    "Show me properties with high sustainability scores",
    "Compare property portfolios by ROI",
    "What are the best investment properties in Houston?",
    "Find apartments near downtown with good amenities",
    "Show me properties with the highest rental yields",
    "Which listings have the best walkability ratings?",
  ],
  analytics: [
    "Predict upcoming market trends",
    "Predict the 2025 market trend in Austin",
    "How will property values change next quarter?",
    "What's the forecast for commercial real estate?",
    "Predict rental yield trends for the next 12 months",
    "Which markets are showing the strongest growth?",
    "How will interest rates affect property values?",
    "Analyze price growth trends over the last 5 years",
    "What are the market trends for sustainable properties?",
    "Predict how lease rates will shift next quarter",
  ],
  insights: [
    "Summarize property insights and performance",
    "What's the rental yield for this property?",
    "Is this property a good long-term investment?",
    "Compare investment potential across property types",
    "What are the maintenance costs for this portfolio?",
    "Show me top insights from my property data",
    "What are the pros and cons of this property?",
    "Analyze market value trends for commercial properties",
    "Which properties are expected to appreciate most?",
    "Provide a comprehensive property analysis",
  ],
  trends: [
    "Compare property portfolios by ROI",
    "Chat with your AI real estate analyst",
    "How have property prices changed this year?",
    "Which cities are showing growth in real estate?",
    "Show me market performance metrics",
    "What are the current market conditions?",
    "Analyze trends across different property types",
    "Which areas have the best growth potential?",
    "What's driving property value changes?",
    "Show me comparative market analysis",
  ],
}

// Get a random prompt from each category (now 4 property-focused categories)
function getRandomPrompts(): Array<{ text: string; category: keyof typeof promptCategories }> {
  return [
    {
      text: promptCategories.property[Math.floor(Math.random() * promptCategories.property.length)],
      category: 'property',
    },
    {
      text: promptCategories.analytics[Math.floor(Math.random() * promptCategories.analytics.length)],
      category: 'analytics',
    },
    {
      text: promptCategories.insights[Math.floor(Math.random() * promptCategories.insights.length)],
      category: 'insights',
    },
    {
      text: promptCategories.trends[Math.floor(Math.random() * promptCategories.trends.length)],
      category: 'trends',
    },
  ]
}

export default function PromptButtons({ onPromptSelect, onRefresh }: PromptButtonsProps) {
  const [prompts, setPrompts] = useState<Array<{ text: string; category: keyof typeof promptCategories }>>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Generate prompts only on client side after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    setPrompts(getRandomPrompts())
  }, [])

  const handleRefresh = () => {
    if (isRefreshing) return
    
    if (onRefresh) {
      onRefresh()
    }
    setIsRefreshing(true)
    
    // Animate fade out, then shuffle and fade in
    setTimeout(() => {
      const newPrompts = getRandomPrompts()
      setPrompts(newPrompts)
      setRefreshKey(prev => prev + 1)
      setTimeout(() => {
        setIsRefreshing(false)
      }, 300)
    }, 300)
  }

  const handlePromptClick = (prompt: { text: string; category: keyof typeof promptCategories }) => {
    if (isRefreshing) return
    onPromptSelect(prompt.text, prompt.category)
  }

  // Calculate font size based on text length
  const getFontSize = (text: string) => {
    const wordCount = text.split(' ').length
    const charCount = text.length
    
    // For very long questions (60+ chars or 12+ words), use smaller font
    if (charCount > 60 || wordCount > 12) {
      return 'text-xs'
    }
    // For medium questions (45-60 chars or 9-12 words), use small font
    if (charCount > 45 || wordCount > 9) {
      return 'text-sm'
    }
    // For shorter questions, use base font
    return 'text-sm md:text-base'
  }

  // Show loading state or empty state until mounted to avoid hydration mismatch
  if (!isMounted || prompts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 mb-8 w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full h-[140px]">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="px-5 py-4 rounded-xl border border-[#1E3028]/40 bg-[#111513]/60 backdrop-blur-sm h-full opacity-50 animate-pulse"
            >
              <div className="flex items-start gap-3 h-full">
                <div className="w-4 h-4 mt-0.5 rounded-full bg-[#1E3028] flex-shrink-0" />
                <div className="h-4 bg-[#1E3028] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-5" /> {/* Placeholder for refresh button */}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 mb-8 w-full px-4">
      {/* Prompt Questions - Fixed height container with grid layout */}
      <div className="w-full max-w-4xl h-[140px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={refreshKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full"
          >
            {prompts.map((prompt, index) => {
              const fontSize = getFontSize(prompt.text)
              return (
                <motion.button
                  key={`${prompt.category}-${index}-${prompt.text.slice(0, 30)}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isRefreshing}
                  className="group relative px-5 py-4 rounded-xl border border-[#1E3028]/40 bg-[#111513]/60 backdrop-blur-sm text-[#C9E3D5] hover:text-[#00A86B] hover:border-[#00A86B]/50 hover:bg-[#00A86B]/10 transition-all duration-300 text-left h-full flex items-start shadow-[0_0_10px_rgba(0,168,107,0.15)] hover:shadow-[0_0_20px_rgba(0,168,107,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 400 }}
                >
                  <div className="flex items-start gap-3 w-full h-full">
                    <MessageCircle className="w-4 h-4 mt-0.5 text-[#00A86B]/60 group-hover:text-[#00A86B] transition-colors flex-shrink-0" />
                    <span className={`${fontSize} leading-relaxed flex-1 line-clamp-2`}>{prompt.text}</span>
                  </div>
                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00A86B]/0 via-[#00A86B]/5 to-[#00A86B]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Refresh Button - Right below questions */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 text-[#B7C4B8] hover:text-[#00A86B] text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut', repeat: isRefreshing ? Infinity : 0 }}
        >
          <RefreshCw size={14} />
        </motion.div>
        <span>{isRefreshing ? 'Refreshing...' : 'Refresh prompts'}</span>
      </motion.button>
    </div>
  )
}
