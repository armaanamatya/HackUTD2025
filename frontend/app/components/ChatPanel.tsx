'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'cura'
  timestamp: Date
}

interface ChatPanelProps {
  onSendMessage: (message: string) => void
  isProcessing?: boolean
}

export default function ChatPanel({ onSendMessage, isProcessing }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m CURA, your AI real estate assistant. I can help you find properties, analyze market trends, and answer any questions you have.',
      sender: 'cura',
      timestamp: new Date(),
    },
    {
      id: '2',
      content: 'What are you looking for today?',
      sender: 'cura',
      timestamp: new Date(),
    },
  ])

  const handleSend = () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    onSendMessage(input)
    setInput('')

    // Simulate CURA response
    setTimeout(() => {
      const curaMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I\'ve updated the property listings based on your query. Take a look at the results!',
        sender: 'cura',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, curaMessage])
    }, 1000)
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[380px] flex-shrink-0 bg-[#111513]/60 backdrop-blur-xl border-r border-[#1E3028] flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#1E3028]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-200 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white font-cbre">CURA Assistant</h3>
            <p className="text-xs text-[#B7C4B8]">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-[#00A86B] text-white'
                    : 'bg-[#111513]/80 border border-[#1E3028] text-[#C9E3D5]'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-white/70' : 'text-[#B7C4B8]'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[#111513]/80 border border-[#1E3028] rounded-xl px-4 py-3">
              <div className="flex gap-1.5">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-[#00A86B] rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-[#00A86B] rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-[#00A86B] rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-[#1E3028] bg-[#111513]/40">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask CURA anything..."
              disabled={isProcessing}
              className="w-full px-4 py-3 pr-10 rounded-xl bg-[#111513]/60 border border-[#1E3028] focus:border-[#00A86B]/50 focus:ring-2 focus:ring-[#00A86B]/20 outline-none text-sm text-white placeholder-[#B7C4B8] transition-all disabled:opacity-50"
            />
            <button
              onClick={() => {}}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B7C4B8] hover:text-[#00A86B] transition-colors"
            >
              <Paperclip size={18} />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {}}
            className="p-3 rounded-xl bg-[#111513]/60 border border-[#1E3028] text-[#B7C4B8] hover:text-white hover:border-[#00A86B]/40 transition-all"
          >
            <Mic size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-3 rounded-xl bg-[#00A86B] text-white hover:bg-[#88C999] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,168,107,0.3)]"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

