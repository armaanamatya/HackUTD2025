'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Bot } from 'lucide-react'

interface ChatResponseProps {
  content: string
}

export default function ChatResponse({ content }: ChatResponseProps) {
  const displayContent = content || "I'm ready to help you with your real estate questions. What would you like to know?"

  return (
    <div className="h-full w-full bg-[#F9FAFB] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
              <Bot size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={18} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Smart Search Response</h3>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
