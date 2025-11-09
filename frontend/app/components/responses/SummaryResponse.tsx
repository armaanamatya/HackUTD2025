'use client'

import { motion } from 'framer-motion'
import { FileText, Sparkles } from 'lucide-react'

interface SummaryResponseProps {
  summary?: string
  insights?: string[]
}

export default function SummaryResponse({ summary, insights }: SummaryResponseProps) {
  const summaryText = summary || 'Document summary will appear here...'
  const insightsList = insights || []

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <FileText size={20} className="text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Document Summary</h3>
      </div>

      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 leading-relaxed mb-6">{summaryText}</p>
      </div>

      {insightsList.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles size={16} />
            Key Insights
          </h4>
          <ul className="space-y-2">
            {insightsList.map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="text-emerald-500 mt-1">•</span>
                <span>{insight}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

