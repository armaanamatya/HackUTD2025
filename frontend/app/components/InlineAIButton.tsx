'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface InlineAIButtonProps {
  context: string
  onAsk: (question: string) => void
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function InlineAIButton({ context, onAsk, position = 'top' }: InlineAIButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    onAsk(`Explain this ${context}`)
  }

  const positionClasses = {
    top: 'top-2 right-2',
    bottom: 'bottom-2 right-2',
    left: 'left-2 top-1/2 -translate-y-1/2',
    right: 'right-2 top-1/2 -translate-y-1/2',
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} z-10`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-cbre-green text-white rounded-lg shadow-lg hover:bg-cbre-green/90 transition-colors text-xs font-medium"
          >
            <Sparkles size={14} />
            <span>Ask CURA</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

