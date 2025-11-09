'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Bot } from 'lucide-react'

interface ChatResponseProps {
  content: string
}

export default function ChatResponse({ content }: ChatResponseProps) {
  const displayContent = content || "I'm ready to help you with your real estate questions. What would you like to know?"

  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <div className="bg-[#111513]/60 backdrop-blur-xl rounded-xl border border-[#1E3028] shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-200 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] flex-shrink-0">
              <Bot size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={18} className="text-[#00A86B]" />
                <h3 className="text-lg font-semibold text-white font-cbre">Smart Search Response</h3>
              </div>
              <div className="prose max-w-none prose-invert">
                <p className="text-[#C9E3D5] leading-relaxed whitespace-pre-wrap">
                  {displayContent}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
