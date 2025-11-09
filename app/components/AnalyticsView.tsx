'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Zap } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface AnalyticsViewProps {
  metrics: any[]
  chartData: any[]
  chartType?: string
  insights?: string[]
}

export default function AnalyticsView({ metrics, chartData, chartType = 'line', insights }: AnalyticsViewProps) {
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
          <BarChart3 size={24} className="text-neon-cyan" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Predictive Analytics</h2>
          <p className="text-sm text-gray-400 font-mono">Forecasting and trend analysis</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((metric, index) => {
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown
          const trendColor = metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass rounded-2xl p-5 border border-gray-800 hover:border-neon-cyan/50 transition-all"
            >
              <div className="text-xs text-gray-400 mb-2 font-mono uppercase">{metric.label}</div>
              <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
              <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                <TrendIcon size={16} />
                <span className="font-semibold">{metric.change}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="glass rounded-2xl p-6 border border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Performance Trends</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg glass-light border border-gray-700">
              <div className="w-3 h-3 rounded-full bg-neon-cyan"></div>
              <span className="text-xs text-gray-300 font-mono">Actual</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg glass-light border border-gray-700">
              <div className="w-3 h-3 rounded-full bg-neon-blue border-2 border-dashed"></div>
              <span className="text-xs text-gray-300 font-mono">Forecast</span>
            </div>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                fill="url(#colorValue)" 
                strokeWidth={3}
                dot={{ fill: '#22d3ee', r: 5 }}
              />
              <Area 
                type="monotone" 
                dataKey="forecast" 
                stroke="#3b82f6" 
                strokeDasharray="8 4"
                fill="url(#colorForecast)"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-6 border border-neon-cyan/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap size={20} className="text-neon-cyan" />
            <h3 className="text-lg font-semibold text-white">Key Insights</h3>
          </div>
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-3 p-3 glass-light rounded-lg border border-gray-800"
              >
                <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-neon-cyan">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-300">{insight}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  )
}
