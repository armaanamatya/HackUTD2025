'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'

interface InsightDrawerProps {
  insights: any
  isOpen: boolean
  onClose: () => void
}

export default function InsightDrawer({ insights, isOpen, onClose }: InsightDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && insights && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-96 border-l border-gray-200 bg-white flex flex-col fixed right-0 top-0 bottom-0 z-50 shadow-xl"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-900">Insights</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {insights.keyPoints && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Key Points</h3>
                  <ul className="space-y-2">
                    {insights.keyPoints.map((point: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 rounded-lg bg-gray-50 border border-gray-200"
                      >
                        <p className="text-sm text-gray-700">{point}</p>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
              
              {insights.recommendations && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Recommendations</h3>
                  <ul className="space-y-2">
                    {insights.recommendations.map((rec: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="p-3 rounded-lg bg-blue-50 border border-blue-200"
                      >
                        <p className="text-sm text-gray-700">{rec}</p>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

