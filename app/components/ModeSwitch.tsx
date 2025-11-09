'use client'

import { motion } from 'framer-motion'
import { AgentMode } from '../types'

interface ModeSwitchProps {
  mode: AgentMode
  onModeChange: (mode: AgentMode) => void
}

const modes: { id: AgentMode; label: string }[] = [
  { id: 'analyze', label: 'Analyze' },
  { id: 'predict', label: 'Predict' },
  { id: 'search', label: 'Search' },
  { id: 'summarize', label: 'Summarize' },
  { id: 'report', label: 'Report' },
]

export default function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  const activeIndex = modes.findIndex(m => m.id === mode)

  return (
    <div className="flex items-center gap-1 px-2 py-1 glass-light rounded-xl border border-gray-800">
      {modes.map((m, index) => (
        <motion.button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            mode === m.id
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {mode === m.id && (
            <motion.div
              layoutId="activeMode"
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/50"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{m.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

