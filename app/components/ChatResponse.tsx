'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Bot } from 'lucide-react'

interface ChatResponseProps {
  content: string
}

export default function ChatResponse({ content }: ChatResponseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-8 border border-gray-800 max-w-4xl mx-auto"
    >
      <div className="flex items-start gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/30 flex items-center justify-center flex-shrink-0"
        >
          <Bot size={24} className="text-neon-cyan" />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-neon-cyan" />
            <h3 className="text-lg font-semibold text-white">Smart Search</h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
              {content}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
