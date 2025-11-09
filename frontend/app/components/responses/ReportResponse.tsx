'use client'

import { motion } from 'framer-motion'
import { FileText, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface ReportResponseProps {
  data?: any
}

export default function ReportResponse({ data }: ReportResponseProps) {
  const reportData = data || {
    title: 'Portfolio Analysis Report',
    metrics: [
      { label: 'Total Value', value: '$2.4B', change: '+12.5%', positive: true },
      { label: 'Occupancy Rate', value: '94.2%', change: '+2.1%', positive: true },
      { label: 'Expenses', value: '$48.2M', change: '-3.2%', positive: true },
    ],
    insights: [
      'Strong portfolio growth driven by office assets',
      'Occupancy rates remain above industry average',
      'Cost efficiency improvements observed',
    ],
    recommendations: [
      'Review 3 leases expiring in Q2',
      'Consider expansion in Austin market',
      'Monitor energy efficiency in Dallas properties',
    ],
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <FileText size={20} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{reportData.title}</h3>
          <p className="text-sm text-gray-500">Generated Report</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {reportData.metrics.map((metric: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-50 rounded-xl"
          >
            <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className={`text-sm font-medium ${metric.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {metric.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Insights */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp size={16} />
          Key Insights
        </h4>
        <ul className="space-y-2">
          {reportData.insights.map((insight: string, index: number) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{insight}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle size={16} />
          Recommendations
        </h4>
        <ul className="space-y-2">
          {reportData.recommendations.map((rec: string, index: number) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-emerald-600">{index + 1}</span>
              </div>
              <span>{rec}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

