'use client'

import { motion } from 'framer-motion'
import Dashboard from './Dashboard'
import { WorkspaceType } from '../lib/constants'

interface WorkspaceContentProps {
  workspace: WorkspaceType
  currentTask: string | null
  setCurrentTask: (task: string | null) => void
  onInlineQuestion: (question: string) => void
}

export default function WorkspaceContent({ 
  workspace, 
  currentTask, 
  setCurrentTask,
  onInlineQuestion 
}: WorkspaceContentProps) {
  if (workspace === 'dashboard') {
    return (
      <Dashboard 
        currentTask={currentTask} 
        setCurrentTask={setCurrentTask}
        onInlineQuestion={onInlineQuestion}
      />
    )
  }

  if (workspace === 'insights') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="glass rounded-2xl p-8 border border-cbre-gray-200 shadow-glass">
          <h2 className="text-2xl font-bold text-cbre-gray-900 mb-4">Property Insights</h2>
          <p className="text-cbre-gray-600 mb-6">
            Deep analysis of your portfolio performance, risk factors, and growth opportunities.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-cbre-gray-50 rounded-xl">
              <h3 className="font-semibold text-cbre-gray-900 mb-2">Top Performers</h3>
              <p className="text-sm text-cbre-gray-600">Austin Complex and Plano HQ show exceptional growth with low risk profiles.</p>
            </div>
            <div className="p-6 bg-cbre-gray-50 rounded-xl">
              <h3 className="font-semibold text-cbre-gray-900 mb-2">Areas of Concern</h3>
              <p className="text-sm text-cbre-gray-600">Dallas Tower requires attention due to medium risk factors and energy efficiency issues.</p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (workspace === 'reports') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="glass rounded-2xl p-8 border border-cbre-gray-200 shadow-glass">
          <h2 className="text-2xl font-bold text-cbre-gray-900 mb-4">Reports</h2>
          <p className="text-cbre-gray-600 mb-6">
            Generate comprehensive reports for your portfolio analysis.
          </p>
          <div className="space-y-4">
            <div className="p-4 border border-cbre-gray-200 rounded-xl hover:border-cbre-green transition-colors cursor-pointer">
              <h3 className="font-semibold text-cbre-gray-900 mb-1">Quarterly Portfolio Report</h3>
              <p className="text-sm text-cbre-gray-600">Comprehensive analysis of Q1 2024 performance</p>
            </div>
            <div className="p-4 border border-cbre-gray-200 rounded-xl hover:border-cbre-green transition-colors cursor-pointer">
              <h3 className="font-semibold text-cbre-gray-900 mb-1">Property Comparison Report</h3>
              <p className="text-sm text-cbre-gray-600">Compare performance across all properties</p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (workspace === 'predictions') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="glass rounded-2xl p-8 border border-cbre-gray-200 shadow-glass">
          <h2 className="text-2xl font-bold text-cbre-gray-900 mb-4">Predictions</h2>
          <p className="text-cbre-gray-600 mb-6">
            AI-powered forecasts for your real estate portfolio.
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-cbre-green/10 rounded-xl border border-cbre-green/20">
              <h3 className="font-semibold text-cbre-gray-900 mb-2">Q2 Forecast</h3>
              <p className="text-2xl font-bold text-cbre-green mb-1">+10-12%</p>
              <p className="text-sm text-cbre-gray-600">Expected value growth</p>
            </div>
            <div className="p-6 bg-cbre-teal/10 rounded-xl border border-cbre-teal/20">
              <h3 className="font-semibold text-cbre-gray-900 mb-2">Occupancy</h3>
              <p className="text-2xl font-bold text-cbre-teal mb-1">93-95%</p>
              <p className="text-sm text-cbre-gray-600">Projected range</p>
            </div>
            <div className="p-6 bg-cbre-gray-50 rounded-xl border border-cbre-gray-200">
              <h3 className="font-semibold text-cbre-gray-900 mb-2">Risk Factors</h3>
              <p className="text-sm text-cbre-gray-600">Energy costs may rise 4-6% due to seasonal factors</p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}

