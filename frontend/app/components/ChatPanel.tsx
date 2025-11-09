'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, X, ChevronLeft } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'

interface ChatPanelProps {
  onSendMessage: (message: string) => void
  isProcessing?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export default function ChatPanel({ onSendMessage, isProcessing, isExpanded = false, onToggleExpand }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const { messages, addMessage, clearChat, isProcessing: storeIsProcessing, setIsProcessing } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const processing = isProcessing || storeIsProcessing

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || processing) return

    // Add user message to store
    addMessage('user', input)
    onSendMessage(input)
    setInput('')
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isExpanded ? "100%" : "420px"
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`${isExpanded ? 'absolute inset-0 z-50' : 'flex-shrink-0'} bg-[#0d0f0e] h-full border ${isExpanded ? 'border-green-900/20 rounded-xl' : 'border-r border-[#1E3028] rounded-l-xl'} shadow-lg overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div className="p-6 border-b border-[#1E3028] flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-200 shadow-[0_0_40px_#22c55e70]"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 360],
              }}
              transition={{
                scale: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />
            <div>
              <h3 className="text-lg font-semibold text-white font-cbre">CURA Assistant</h3>
              <p className="text-xs text-[#B7C4B8]">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded && onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="p-1.5 rounded-md text-[#B7C4B8] hover:text-[#00A86B] hover:bg-[#00A86B]/10 transition-colors"
                title="Collapse chat"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded-md text-[#B7C4B8] hover:text-[#00A86B] hover:bg-[#00A86B]/10 transition-colors"
                title="Clear chat"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar ${isExpanded ? 'max-w-4xl mx-auto w-full' : ''}`}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#B7C4B8] text-sm italic">No conversations yet. Start chatting to begin!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className={`text-xs mb-1 px-2 ${message.role === 'user' ? 'text-[#B7C4B8]' : 'text-[#00A86B]'}`}>
                  {message.role === 'user' ? 'You' : 'CURA'} — {message.timestamp}
                </span>
                <div
                  className={`${isExpanded ? 'max-w-3xl' : 'max-w-[85%]'} rounded-xl px-4 py-3 transition-all hover:shadow-[0_0_10px_rgba(0,168,107,0.15)] ${
                    message.role === 'user'
                      ? 'bg-[#1C1F1D] text-white'
                      : 'bg-[#00A86B]/10 border border-[#00A86B]/20 text-[#C9E3D5]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        )}

        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[#00A86B]/10 border border-[#00A86B]/20 rounded-xl px-4 py-3">
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
      <div className={`p-4 border-t border-[#1E3028] bg-[#111513]/40 flex-shrink-0 ${isExpanded ? 'max-w-4xl mx-auto w-full' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask CURA anything..."
              disabled={processing}
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
            onClick={handleSend}
            disabled={!input.trim() || processing}
            className="p-3 rounded-xl bg-[#00A86B] text-white hover:bg-[#88C999] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,168,107,0.3)]"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

