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
        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-200 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <Lightbulb size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white font-cbre">Insight Summary Dashboard</h2>
          <p className="text-sm text-[#B7C4B8] font-cbre">Consolidated view across all data sources</p>
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
            className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl p-5 border border-[#1E3028] hover:border-[#00A86B]/50 transition-all"
          >
            <div className="text-xs text-[#B7C4B8] mb-2 font-cbre uppercase">{kpi.label}</div>
            <div className="text-3xl font-bold text-white mb-1 font-cbre">{kpi.value}</div>
            <div className="text-sm text-[#00A86B] font-semibold font-cbre">{kpi.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {chartData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl p-6 border border-[#1E3028]"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={20} className="text-[#00A86B]" />
            <h3 className="text-lg font-semibold text-white font-cbre">Trend Overview</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSummary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A86B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00A86B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 48, 40, 0.5)" />
                <XAxis dataKey="name" stroke="#B7C4B8" />
                <YAxis stroke="#B7C4B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111513',
                    border: '1px solid #1E3028',
                    borderRadius: '12px',
                    color: '#C9E3D5',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00A86B" 
                  fill="url(#colorSummary)" 
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#88C999" 
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
        className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl p-6 border border-[#1E3028]"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={20} className="text-[#00A86B]" />
          <h3 className="text-lg font-semibold text-white font-cbre">Top Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="p-4 bg-[#111513]/40 rounded-lg border border-[#1E3028] hover:border-[#00A86B]/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00A86B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#00A86B]">{index + 1}</span>
                </div>
                <p className="text-sm text-[#C9E3D5]">{insight}</p>
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
        className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl p-6 border border-[#00A86B]/40 shadow-[0_0_15px_rgba(0,168,107,0.2)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <Target size={20} className="text-[#00A86B]" />
          <h3 className="text-lg font-semibold text-white font-cbre">Recommendations</h3>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + index * 0.1 }}
              className="flex items-start gap-3 p-4 bg-[#111513]/40 rounded-lg border border-[#00A86B]/20"
            >
              <div className="w-7 h-7 rounded-full bg-[#00A86B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-[#00A86B]">{index + 1}</span>
              </div>
              <p className="text-sm text-[#C9E3D5]">{rec}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
