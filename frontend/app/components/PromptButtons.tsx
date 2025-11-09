'use client'

import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface PromptButtonsProps {
  onPromptSelect: (prompt: string) => void
  onRefresh?: () => void
}

const defaultPrompts = [
  {
    text: 'Get property insights',
    query: 'show me properties in Jakarta with market analysis',
  },
  {
    text: 'Predict market trends',
    query: 'predict next quarter performance and market trends',
  },
  {
    text: 'Analyze contracts',
    query: 'analyze real estate contracts and extract key terms',
  },
  {
    text: 'Summarize documents',
    query: 'summarize key points from uploaded documents',
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
        {prompts.map((prompt, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPromptSelect(prompt.query)}
            className="px-4 md:px-6 py-2.5 md:py-3 rounded-md bg-[#1f2228] hover:bg-[#262a31] text-white text-xs md:text-sm font-medium transition-colors border border-white/5 hover:border-white/10 shadow-lg"
            style={{ fontWeight: 500 }}
          >
            {prompt.text}
          </motion.button>
        ))}
      </div>

      {/* Refresh Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRefresh}
        className="flex items-center gap-2 text-white/60 hover:text-white/80 text-xs font-medium transition-colors"
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

