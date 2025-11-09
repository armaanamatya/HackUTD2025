'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Bot, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { CURA_SYSTEM_PROMPT } from '../lib/constants'
import { WorkspaceType } from '../lib/constants'

interface Message {
  id: number
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
}

interface AssistantPanelProps {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  currentWorkspace: WorkspaceType
  onInlineQuestion?: (question: string) => void
}

const CONTEXTUAL_PROMPTS: Record<WorkspaceType, string> = {
  dashboard: 'The user is viewing the dashboard. Focus on metrics, trends, and quick insights.',
  insights: 'The user is in the Insights section. Provide detailed analysis and findings.',
  reports: 'The user is generating reports. Help with data compilation and formatting.',
  predictions: 'The user is viewing predictions. Discuss forecasts, trends, and future scenarios.',
  settings: 'The user is in settings. Help with configuration and preferences.',
}

export default function AssistantPanel({ 
  messages, 
  setMessages, 
  currentWorkspace,
  onInlineQuestion 
}: AssistantPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle inline questions when they come from the dashboard
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.type === 'user' && lastMessage.text.startsWith('Explain this') && !isTyping) {
        // Auto-respond to inline questions
        setIsTyping(true)
        const responseText = generateContextualResponse(lastMessage.text)
        setTimeout(() => {
          const aiResponse: Message = {
            id: messages.length + 1,
            type: 'assistant',
            text: responseText,
            timestamp: new Date(),
          }
          setMessages([...messages, aiResponse])
          setIsTyping(false)
        }, 1000)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, currentWorkspace])

  const generateContextualResponse = (userInput: string): string => {
    const context = CONTEXTUAL_PROMPTS[currentWorkspace] || ''
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes('explain') || lowerInput.includes('what') || lowerInput.includes('why')) {
      if (currentWorkspace === 'dashboard') {
        return `Based on the dashboard metrics, here's what's happening: Your portfolio shows strong growth with a 12.5% increase in total value. Occupancy is at 94.2%, which is excellent. Expenses decreased by 3.2%, indicating efficient operations. The market trends chart shows consistent upward momentum, particularly in the last quarter.`
      }
      if (currentWorkspace === 'predictions') {
        return `Looking at predictive models, I forecast continued growth in the next quarter. Based on current trends, expect occupancy to remain above 93%, with potential value increases of 8-12%. However, monitor energy costs as they may rise 4-6% due to seasonal factors.`
      }
      if (currentWorkspace === 'insights') {
        return `Key insights from your portfolio: Plano HQ shows exceptional growth at 12% with low risk. Dallas Tower has moderate growth but medium risk - worth monitoring. Austin Complex is your strongest performer at 15% growth. Consider reallocating resources to high-growth, low-risk properties.`
      }
    }

    if (lowerInput.includes('compare')) {
      return `Comparing your properties: Plano HQ (12% growth, low risk) and Austin Complex (15% growth, low risk) are your top performers. Dallas Tower (8% growth, medium risk) needs attention. I recommend focusing investment on the Austin market given its strong performance.`
    }

    if (lowerInput.includes('recommend') || lowerInput.includes('suggest')) {
      return `Based on current data, I recommend: 1) Review the 3 leases expiring in Q2, 2) Address energy efficiency in Dallas properties to reduce risk, 3) Consider expansion in Austin given 15% growth, 4) Monitor occupancy rates closely as they're near capacity.`
    }

    return `I understand you're asking about "${userInput}". ${context} How can I help you analyze your real estate portfolio?`
  }

  const handleSend = (text?: string, skipUserMessage = false) => {
    const messageText = text || inputValue
    if (!messageText.trim()) return

    if (!skipUserMessage) {
      const newUserMessage: Message = {
        id: messages.length + 1,
        type: 'user',
        text: messageText,
        timestamp: new Date(),
      }
      setMessages([...messages, newUserMessage])
    }

    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'assistant',
        text: generateContextualResponse(messageText),
        timestamp: new Date(),
      }
      setMessages([...messages, skipUserMessage ? messages : [...messages, {
        id: messages.length + 1,
        type: 'user',
        text: messageText,
        timestamp: new Date(),
      }], aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 500)
  }

  return (
    <motion.div
      initial={{ x: isCollapsed ? 0 : 0 }}
      animate={{ width: isCollapsed ? '60px' : '384px' }}
      className="h-full flex flex-col glass-dark border-l border-cbre-gray-200 relative transition-all duration-300"
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-cbre-gray-200 shadow-lg flex items-center justify-center hover:bg-cbre-gray-50 transition-colors"
      >
        {isCollapsed ? (
          <ChevronLeft size={16} className="text-cbre-gray-600" />
        ) : (
          <ChevronRight size={16} className="text-cbre-gray-600" />
        )}
      </button>

      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="px-6 py-4 border-b border-cbre-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-cbre-gray-50/30">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cbre-green to-cbre-teal flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
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
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-cbre-green rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-cbre-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
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
                placeholder="Ask CURA anything..."
                className="flex-1 bg-white border border-cbre-gray-200 rounded-xl px-4 py-3 outline-none focus:border-cbre-green focus:ring-2 focus:ring-cbre-green/20 transition-all text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                className="p-3 rounded-xl bg-cbre-green text-white hover:bg-cbre-green/90 transition-colors shadow-lg"
              >
                <Send size={20} />
              </motion.button>
            </div>
            <p className="text-xs text-cbre-gray-400 mt-2 text-center">
              Context: {currentWorkspace.charAt(0).toUpperCase() + currentWorkspace.slice(1)}
            </p>
          </div>
        </>
      )}

      {isCollapsed && (
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bot size={24} className="text-cbre-green" />
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

