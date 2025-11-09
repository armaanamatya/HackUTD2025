'use client'

import { motion } from 'framer-motion'
import { RefreshCw, BarChart3, Home, FileText, Search } from 'lucide-react'
import { useState } from 'react'

interface PromptButtonsProps {
  onPromptSelect: (prompt: string) => void
  onRefresh?: () => void
}

const defaultPrompts = [
  {
    text: 'Get property insights',
    query: 'show me properties in Jakarta with market analysis',
    icon: Home,
  },
  {
    text: 'Predict market trends',
    query: 'predict next quarter performance and market trends',
    icon: BarChart3,
  },
  {
    text: 'Analyze contracts',
    query: 'analyze real estate contracts and extract key terms',
    icon: FileText,
  },
  {
    text: 'Summarize documents',
    query: 'summarize key points from uploaded documents',
    icon: Search,
  },
]

export default function PromptButtons({ onPromptSelect, onRefresh }: PromptButtonsProps) {
  const [prompts, setPrompts] = useState(defaultPrompts)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
    setIsRefreshing(true)
    // Shuffle prompts for variety (optional)
    setTimeout(() => {
      setPrompts([...prompts].sort(() => Math.random() - 0.5))
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <div className="flex flex-col items-center gap-4 mb-8 w-full px-4">
      {/* Prompt Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-3xl w-full">
        {prompts.map((prompt, index) => {
          const Icon = prompt.icon
          return (
            <motion.button
              key={`${prompt.text}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPromptSelect(prompt.query)}
              className="flex items-center gap-2 bg-[#111513]/60 border border-[#1E3028] text-[#C9E3D5] hover:bg-[#00A86B]/10 hover:border-[#00A86B]/40 hover:text-white transition-all duration-300 rounded-md px-5 py-2.5 shadow-[0_0_10px_rgba(0,168,107,0.15)] text-xs md:text-sm font-medium"
              style={{ fontWeight: 500 }}
            >
              <Icon className="w-4 h-4" />
              {prompt.text}
            </motion.button>
          )
        })}
      </div>

      {/* Refresh Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRefresh}
        className="flex items-center gap-2 text-[#B7C4B8] hover:text-white/80 text-xs font-medium transition-colors"
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <RefreshCw size={14} />
        </motion.div>
        <span>Refresh prompts</span>
      </motion.button>
    </div>
  )
}

