'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'

interface MemoryLogProps {
  logs: string[]
}

export default function MemoryLog({ logs }: MemoryLogProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 border-r border-gray-200 bg-white flex flex-col"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">Memory Log</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {logs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No actions yet</p>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={`${log}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <p className="text-xs text-gray-600 leading-relaxed">{log}</p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}

