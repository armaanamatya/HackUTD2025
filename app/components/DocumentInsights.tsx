'use client'

import { motion } from 'framer-motion'
import { FileText, Calendar, DollarSign, AlertCircle, CheckCircle, Shield } from 'lucide-react'

interface Document {
  name: string
  type: string
  extracted: Record<string, string>
  clauses: string[]
  risks: string[]
  compliance: number
}

interface DocumentInsightsProps {
  documents: Document[]
  summary: any
}

export default function DocumentInsights({ documents, summary }: DocumentInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/30 flex items-center justify-center">
          <FileText size={24} className="text-neon-cyan" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Document Intelligence</h2>
          <p className="text-sm text-gray-400 font-mono">Extracted insights from {documents.length} documents</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 border border-gray-800"
        >
          <div className="text-xs text-gray-400 mb-1 font-mono">Total Documents</div>
          <div className="text-2xl font-bold text-white">{summary.totalDocuments}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4 border border-yellow-500/30"
        >
          <div className="text-xs text-gray-400 mb-1 font-mono">Expiring Soon</div>
          <div className="text-2xl font-bold text-yellow-400">{summary.expiringSoon}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4 border border-gray-800"
        >
          <div className="text-xs text-gray-400 mb-1 font-mono">Avg Compliance</div>
          <div className="text-2xl font-bold text-emerald-400">{summary.averageCompliance}%</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-4 border border-gray-800"
        >
          <div className="text-xs text-gray-400 mb-1 font-mono">Total Clauses</div>
          <div className="text-2xl font-bold text-white">{summary.totalClauses}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-4 border border-emerald-500/30"
        >
          <div className="text-xs text-gray-400 mb-1 font-mono">Monthly Rent</div>
          <div className="text-2xl font-bold text-emerald-400">{summary.totalMonthlyRent}</div>
        </motion.div>
      </div>

      {/* Documents */}
      <div className="space-y-6">
        {documents.map((doc, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
            className="glass rounded-2xl p-6 border border-gray-800"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/30 flex items-center justify-center">
                  <FileText size={24} className="text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{doc.name}</h3>
                  <p className="text-sm text-gray-400 font-mono">{doc.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg glass-light border border-gray-700">
                <Shield size={16} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">{doc.compliance}%</span>
              </div>
            </div>

            {/* Extracted Data Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {Object.entries(doc.extracted).map(([key, value], i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 + i * 0.05 }}
                  className="p-4 glass-light rounded-lg border border-gray-800"
                >
                  <div className="text-xs text-gray-400 mb-2 font-mono uppercase">{key}</div>
                  <div className="text-sm font-semibold text-white">{value}</div>
                </motion.div>
              ))}
            </div>

            {/* Key Clauses */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-neon-cyan" />
                <h4 className="text-sm font-semibold text-gray-300 font-mono uppercase">Key Clauses</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {doc.clauses.map((clause, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 + i * 0.05 }}
                    className="flex items-start gap-2 p-3 glass-light rounded-lg border border-gray-800"
                  >
                    <span className="text-neon-cyan mt-0.5">•</span>
                    <span className="text-sm text-gray-300">{clause}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Risks */}
            {doc.risks && doc.risks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-yellow-400" />
                  <h4 className="text-sm font-semibold text-yellow-400 font-mono uppercase">Risks & Alerts</h4>
                </div>
                <div className="space-y-2">
                  {doc.risks.map((risk, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 + i * 0.05 }}
                      className="flex items-start gap-2 p-3 glass-light rounded-lg border border-yellow-500/30"
                    >
                      <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{risk}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
