'use client'

import { motion } from 'framer-motion'
import { Upload, Zap } from 'lucide-react'
import ModeSwitch from './ModeSwitch'
import { AgentMode } from '../types'

interface TopbarProps {
  mode: AgentMode
  onModeChange: (mode: AgentMode) => void
}

export default function Topbar({ mode, onModeChange }: TopbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-md">
            <Zap size={20} className="text-white" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-blue-200/30 blur-xl animate-pulse"></div>
        </motion.div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">CURA</h1>
          <p className="text-xs text-gray-500">Agentic AI Workspace</p>
        </div>
      </div>

      {/* Mode Switch */}
      <ModeSwitch mode={mode} onModeChange={onModeChange} />

      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-500 transition-colors shadow-sm"
      >
        <Upload size={18} className="text-blue-600" />
        <span className="text-sm text-gray-700">Upload</span>
      </motion.button>
    </motion.header>
  )
}
