'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Lightbulb, Target, BarChart3 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface InsightSummaryDashboardProps {
  kpis: any[]
  topInsights: string[]
  recommendations: string[]
  chartData?: any[]
}

export default function InsightSummaryDashboard({ kpis, topInsights, recommendations, chartData }: InsightSummaryDashboardProps) {
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
          <Lightbulb size={24} className="text-neon-cyan" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Insight Summary Dashboard</h2>
          <p className="text-sm text-gray-400 font-mono">Consolidated view across all data sources</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass rounded-2xl p-5 border border-gray-800 hover:border-neon-cyan/50 transition-all"
          >
            <div className="text-xs text-gray-400 mb-2 font-mono uppercase">{kpi.label}</div>
            <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
            <div className="text-sm text-emerald-400 font-semibold">{kpi.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {chartData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={20} className="text-neon-cyan" />
            <h3 className="text-lg font-semibold text-white">Trend Overview</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSummary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22d3ee" 
                  fill="url(#colorSummary)" 
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#3b82f6" 
                  strokeDasharray="8 4"
                  fill="none"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Top Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6 border border-gray-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={20} className="text-neon-cyan" />
          <h3 className="text-lg font-semibold text-white">Top Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="p-4 glass-light rounded-lg border border-gray-800 hover:border-neon-cyan/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-neon-cyan">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-300">{insight}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="glass rounded-2xl p-6 border border-neon-cyan/30 neon-glow"
      >
        <div className="flex items-center gap-3 mb-4">
          <Target size={20} className="text-neon-cyan" />
          <h3 className="text-lg font-semibold text-white">Recommendations</h3>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + index * 0.1 }}
              className="flex items-start gap-3 p-4 glass-light rounded-lg border border-neon-cyan/20"
            >
              <div className="w-7 h-7 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-neon-cyan">{index + 1}</span>
              </div>
              <p className="text-sm text-gray-300">{rec}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
