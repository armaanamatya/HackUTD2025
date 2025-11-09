'use client'

import { motion } from 'framer-motion'
import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Send, Lock, ChevronDown, Camera, Paperclip } from 'lucide-react'

interface ChatInputBarProps {
  onSendMessage?: (message: string) => void
  placeholder?: string
  initialValue?: string
}

export default function ChatInputBar({ 
  onSendMessage, 
  placeholder = 'How can CURA help you today?',
  initialValue = ''
}: ChatInputBarProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)
      }
    }

    if (showModelDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showModelDropdown])

  const handleSend = () => {
    if (!inputValue.trim()) return

    if (onSendMessage) {
      onSendMessage(inputValue)
      setInputValue('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Input Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="relative"
      >
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full px-6 py-4 pr-32 rounded-xl bg-[#111513]/60 backdrop-blur-sm border border-[#1E3028] text-white placeholder-[#B7C4B8] focus:outline-none focus:border-[#00A86B]/50 transition-all duration-300 text-base font-normal"
            style={{
              boxShadow: isFocused 
                ? '0 4px 20px rgba(0,168,107,0.2)' 
                : '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          />
          
          {/* Right side icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              className="p-2 text-[#B7C4B8]/60 hover:text-[#00A86B] transition-colors"
              title="Attach file"
            >
              <Paperclip size={18} />
            </button>
            <button
              className="p-2 text-[#B7C4B8]/60 hover:text-[#00A86B] transition-colors"
              title="Camera"
            >
              <Camera size={18} />
            </button>
            {inputValue.trim() && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleSend}
                className="p-2 text-[#00A86B] hover:text-[#88C999] transition-colors"
                title="Send message"
              >
                <Send size={18} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Row: Model Selection & Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 px-2 gap-3 md:gap-0"
      >
        {/* Left: Model Selection */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-2 text-[#B7C4B8] hover:text-white hover:border-[#00A86B]/40 text-xs md:text-sm font-medium transition-all duration-300 px-3 py-1.5 rounded border border-[#1E3028] hover:bg-[#00A86B]/5"
              style={{ fontWeight: 500 }}
            >
              <span>CURA 3.5 Smart</span>
              <Lock size={12} className="text-[#B7C4B8]/60" />
              <ChevronDown size={14} className={`text-[#B7C4B8]/60 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown (simplified - can be enhanced) */}
            {showModelDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 left-0 bg-[#111513]/95 backdrop-blur-md border border-[#1E3028] rounded-lg p-2 min-w-[200px] shadow-xl z-50"
              >
                <button 
                  onClick={() => setShowModelDropdown(false)}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-[#00A86B]/10 hover:text-white rounded transition-colors"
                >
                  CURA 3.5 Smart
                </button>
                <button 
                  onClick={() => setShowModelDropdown(false)}
                  className="w-full text-left px-3 py-2 text-sm text-[#B7C4B8] hover:bg-[#00A86B]/10 hover:text-white rounded transition-colors"
                >
                  CURA 4.0 Pro
                </button>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#111513]/60 border border-[#1E3028]">
            <span className="text-xs text-[#B7C4B8]">Formal</span>
            <ChevronDown size={12} className="text-[#B7C4B8]/60" />
          </div>
        </div>

        {/* Right: Hints */}
        <div className="flex items-center gap-4 text-xs text-[#B7C4B8]">
          <span className="hidden sm:inline">Use shift + return for new line</span>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="text-xs text-[#B7C4B8]/60 mt-3 text-center"
      >
        CURA can make mistakes. Please verify results.
      </motion.p>
    </div>
  )
}

