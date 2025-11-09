import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Bot, User } from 'lucide-react'

interface Message {
  id: number
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
}

interface ChatbotPanelProps {
  messages: Message[]
  setMessages: (messages: Message[]) => void
}

export default function ChatbotPanel({ messages, setMessages }: ChatbotPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newUserMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    }

    setMessages([...messages, newUserMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'assistant',
        text: 'I\'m analyzing the data and will provide insights shortly. Based on current trends, I recommend reviewing the quarterly reports for deeper insights.',
        timestamp: new Date(),
      }
      setMessages([...messages, newUserMessage, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="glass rounded-2xl border border-cbre-gray-200 shadow-glass overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-cbre-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cbre-green to-cbre-teal flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cbre-green rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-bold text-cbre-gray-900">CURA Assistant</h3>
            <p className="text-xs text-cbre-gray-500">Your AI Analyst</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-cbre-gray-50/30">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cbre-green to-cbre-teal flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-cbre-green text-white'
                    : 'bg-white text-cbre-gray-900 border border-cbre-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-cbre-gray-200 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-cbre-gray-600" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cbre-green to-cbre-teal flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white border border-cbre-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-cbre-green rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-cbre-green rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-cbre-green rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-cbre-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-cbre-gray-100 cursor-pointer transition-colors"
          >
            <Mic size={20} className="text-cbre-gray-400" />
          </motion.div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-white border border-cbre-gray-200 rounded-xl px-4 py-3 outline-none focus:border-cbre-green focus:ring-2 focus:ring-cbre-green/20 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            className="p-3 rounded-xl bg-cbre-green text-white hover:bg-cbre-green/90 transition-colors shadow-lg"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

