'use client'

import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'
import { Message } from '../types'
import ChartResponse from './responses/ChartResponse'
import ReportResponse from './responses/ReportResponse'
import SummaryResponse from './responses/SummaryResponse'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user'

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gray-200' 
          : 'bg-gradient-to-br from-emerald-500 to-teal-500'
      }`}>
        {isUser ? (
          <User size={18} className="text-gray-600" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        {/* Text Content */}
        {message.content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl px-5 py-3 max-w-[85%] ${
              isUser
                ? 'bg-emerald-500 text-white'
                : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </motion.div>
        )}

        {/* Multimodal Response */}
        {message.response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-2"
          >
            {message.response.type === 'chart' && (
              <ChartResponse data={message.response.chartData} type={message.response.chartType} />
            )}
            {message.response.type === 'report' && (
              <ReportResponse data={message.response.data} />
            )}
            {message.response.type === 'summary' && (
              <SummaryResponse summary={message.response.summary} insights={message.response.insights} />
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

