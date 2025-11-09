'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Upload, Mic, Slash } from 'lucide-react'
import { AgentMode } from '../types'

interface CommandDockProps {
  onCommand: (query: string) => void
  isProcessing: boolean
  progress: number
  mode: AgentMode
}

const slashCommands = [
  { cmd: '/predict', desc: 'Predict future trends' },
  { cmd: '/analyze', desc: 'Analyze current data' },
  { cmd: '/visualize', desc: 'Create visualization' },
  { cmd: '/summarize', desc: 'Summarize documents' },
  { cmd: '/report', desc: 'Generate report' },
]

export default function CommandDock({ onCommand, isProcessing, progress, mode }: CommandDockProps) {
  const [input, setInput] = useState('')
  const [showCommands, setShowCommands] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
        setShowCommands(true)
      }
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleSubmit = () => {
    if (!input.trim() || isProcessing) return
    onCommand(input.trim())
    setInput('')
    setShowCommands(false)
  }

  const handleSlashCommand = (cmd: string) => {
    setInput(cmd + ' ')
    setShowCommands(false)
    inputRef.current?.focus()
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-6 py-4 border-t border-gray-200 bg-white"
    >
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 4 }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 h-1 bg-gray-200 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}

        {/* Slash Commands */}
        <AnimatePresence>
          {showCommands && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <Slash size={14} className="text-blue-600" />
                <span className="text-xs text-gray-600">Commands</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {slashCommands.map((command) => (
                  <motion.button
                    key={command.cmd}
                    onClick={() => handleSlashCommand(command.cmd)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-blue-500 text-xs text-gray-700 hover:text-blue-600 transition-colors shadow-sm"
                  >
                    {command.cmd}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setShowCommands(e.target.value.startsWith('/'))
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              onFocus={() => {
                if (input.startsWith('/')) setShowCommands(true)
              }}
              placeholder={`Ask CURA to ${mode}... (press / for commands)`}
              className="w-full px-6 py-4 pr-24 rounded-2xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900 placeholder-gray-400 text-sm"
              disabled={isProcessing}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Upload size={16} className="text-gray-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mic size={16} className="text-gray-500" />
              </motion.button>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing}
            className="p-4 rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

