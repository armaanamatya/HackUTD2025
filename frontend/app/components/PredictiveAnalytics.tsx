'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RefreshCcw, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ChevronRight, 
  Calendar,
  Info,
  BarChart3,
  Clock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

// Time period type
type TimePeriod = '7d' | '30d' | '90d' | '1y'

// Enterprise color palette - muted slate tones
const colors = {
  // Backgrounds
  bg: 'bg-slate-50',
  bgCard: 'bg-white',
  bgHover: 'bg-slate-100',
  bgGlass: 'bg-white/80 backdrop-blur-xl',
  
  // Text - hierarchical
  textPrimary: 'text-slate-900',
  textSecondary: 'text-slate-600',
  textTertiary: 'text-slate-500',
  textMuted: 'text-slate-400',
  
  // Borders
  border: 'border-slate-200',
  borderHover: 'border-slate-300',
  borderSubtle: 'border-slate-100',
  
  // Accents - muted corporate
  accentBlue: '#475569', // slate-600
  accentGreen: '#059669', // emerald-600
  accentAmber: '#D97706', // amber-600
  accentRed: '#DC2626', // red-600
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}

interface PredictiveAnalyticsProps {
  data: {
    metrics: Array<{
      label: string
      value: string
      change: string
      trend: 'up' | 'down'
      subtext?: string
      sparklineData?: Array<{ value: number }>
      comparisonBadge?: {
        text: string
        type: 'success' | 'warning' | 'info'
      }
      tooltipText?: string
    }>
    predictions: Array<{
      assetType: string
      dropRisk: number
      reason: string
      assetId: string
    }>
    insights: Array<{
      title: string
      description: string
      confidence: number
      type: 'warning' | 'growth' | 'alert'
      assetId?: string
    }>
    modelStats?: {
      accuracy: string
      datasetSize: string
    }
  }
}

// Compact Sparkline Component
const Sparkline = ({ data, color = colors.accentBlue }: { data: Array<{ value: number }>, color?: string }) => {
  if (!data || data.length === 0) return null

  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((d.value - min) / range) * 100,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg viewBox="0 0 100 20" className="w-full h-4" preserveAspectRatio="none">
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        opacity={0.6}
      />
    </svg>
  )
}

export default function PredictiveAnalytics({ data }: PredictiveAnalyticsProps) {
  const { metrics, predictions, insights, modelStats } = data

  // State management
  const [highlightedAsset, setHighlightedAsset] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')
  const [showFilters, setShowFilters] = useState(false)

  const handleInsightClick = (assetId: string | undefined) => {
    if (assetId) {
      setHighlightedAsset(assetId === highlightedAsset ? null : assetId)
    }
  }

  // Time period options
  const timePeriodOptions: Array<{ value: TimePeriod; label: string }> = [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
    { value: '1y', label: '1y' },
  ]

  // Calculate average risk for reference line
  const avgRisk = predictions.reduce((sum, p) => sum + p.dropRisk, 0) / predictions.length

  return (
    <div className={`h-full w-full overflow-hidden ${colors.bg} relative`}>
      {/* Subtle ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative h-full max-w-[1600px] mx-auto grid grid-cols-[2fr_1fr] gap-3 p-3 overflow-hidden">
        {/* LEFT COLUMN - Main Analytics Canvas */}
        <div className="space-y-3 overflow-y-auto pr-1.5 custom-scrollbar">
          {/* Unified Glass Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${colors.bgGlass} rounded-lg border ${colors.borderSubtle} shadow-sm p-2 flex items-center justify-between flex-shrink-0`}
          >
            <div className="flex items-center gap-3">
              <div>
                <h1 className={`${colors.textPrimary} text-sm font-semibold tracking-tight`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                  Predictive Analytics
                </h1>
                <p className={`${colors.textTertiary} text-xs mt-0.5`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                  Market trend analysis and risk assessment
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Time Period Selector */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-2.5 py-1.5 rounded-md ${colors.bgCard} ${colors.textSecondary} text-xs font-medium flex items-center gap-1.5 border ${colors.border} hover:${colors.borderHover} transition-all shadow-sm`}
                  style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
                >
                  <Calendar className="w-3 h-3" />
                  {timePeriodOptions.find(o => o.value === timePeriod)?.label}
                </motion.button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`absolute right-0 mt-1.5 ${colors.bgCard} rounded-md shadow-lg border ${colors.border} overflow-hidden z-20 min-w-[120px]`}
                    >
                      {timePeriodOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setTimePeriod(option.value)
                            setShowFilters(false)
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors ${
                            timePeriod === option.value
                              ? `${colors.bgHover} ${colors.textPrimary}`
                              : `${colors.textSecondary} hover:${colors.bgHover}`
                          }`}
                          style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 rounded-md ${colors.bgHover} ${colors.textSecondary} hover:${colors.textPrimary} transition-colors`}
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-slate-800 transition-colors shadow-sm`}
                style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
              >
                <Download className="w-3 h-3" />
                Export
              </motion.button>
            </div>
          </motion.div>

          {/* KPI Cards - Compact Enterprise Style */}
          <div className="grid grid-cols-3 gap-2 flex-shrink-0">
            {metrics.map((metric, index) => {
              const isPositive = metric.change.startsWith('+')
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
                  whileHover={{ y: -1 }}
                  className={`${colors.bgCard} rounded-lg border ${colors.border} shadow-sm p-2.5 transition-all duration-200 hover:shadow-md hover:border-slate-300`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className={`${colors.textTertiary} text-xs font-medium uppercase tracking-wider`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', letterSpacing: '0.05em' }}>
                      {metric.label}
                    </span>
                    <div className={`p-1 rounded ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      {isPositive ? (
                        <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className={`${colors.textPrimary} text-lg font-semibold tracking-tight mb-1`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                    {metric.value}
                  </div>

                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                      {metric.change}
                    </span>
                    <span className={`${colors.textTertiary} text-xs`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                      {metric.subtext || 'vs last period'}
                    </span>
                  </div>

                  {/* Sparkline */}
                  {metric.sparklineData && metric.sparklineData.length > 0 && (
                    <div className="opacity-60">
                      <Sparkline
                        data={metric.sparklineData}
                        color={isPositive ? colors.accentGreen : colors.accentRed}
                      />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Chart Section - Modern Enterprise Design */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
            className={`${colors.bgCard} rounded-lg border ${colors.border} shadow-sm p-3 flex-shrink-0`}
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className={`${colors.textPrimary} text-sm font-semibold mb-0.5`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                  Asset Risk Analysis
                </h3>
                <p className={`${colors.textTertiary} text-xs`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                  Drop probability by asset type
                </p>
              </div>
              <div className={`flex items-center gap-2 px-2 py-1 rounded-md bg-slate-50 border ${colors.borderSubtle}`}>
                <BarChart3 className="w-3 h-3 text-slate-600" />
                <span className={`${colors.textSecondary} text-xs font-medium`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                  Risk Score
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={predictions} margin={{ top: 8, right: 8, left: -16, bottom: 50 }}>
                <defs>
                  {/* Muted slate gradients */}
                  <linearGradient id="lowRiskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="mediumRiskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#D97706" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="highRiskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="highlightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#475569" stopOpacity={1} />
                    <stop offset="100%" stopColor="#64748B" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="2 2"
                  stroke="#E2E8F0"
                  strokeWidth={1}
                />
                <XAxis
                  dataKey="assetType"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                  dy={8}
                  angle={-35}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  dx={-8}
                />

                {/* Reference Line */}
                <ReferenceLine
                  y={avgRisk}
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Avg: ${(avgRisk * 100).toFixed(1)}%`,
                    position: 'right',
                    fill: '#64748B',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(71, 85, 105, 0.05)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null
                    const data = payload[0].payload
                    const riskLevel = data.dropRisk < 0.05 ? 'Low' : data.dropRisk < 0.10 ? 'Medium' : 'High'
                    const riskColors = {
                      Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      Medium: 'bg-amber-50 text-amber-700 border-amber-200',
                      High: 'bg-red-50 text-red-700 border-red-200'
                    }
                    
                    return (
                      <div className={`${colors.bgCard} rounded-lg border ${colors.border} shadow-lg p-2.5`}>
                        <div className={`${colors.textPrimary} text-xs font-semibold mb-1.5`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                          {data.assetType}
                        </div>
                        <div className="space-y-1">
                          <div className={`${colors.textPrimary} text-sm font-semibold`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                            {(data.dropRisk * 100).toFixed(1)}% Risk
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded border inline-block ${riskColors[riskLevel]}`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                            {riskLevel}
                          </div>
                          <div className={`${colors.textTertiary} text-xs mt-1.5`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                            {data.reason}
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar
                  dataKey="dropRisk"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                >
                  {predictions.map((entry, index) => {
                    const getRiskGradient = (risk: number) => {
                      if (risk < 0.05) return 'url(#lowRiskGradient)'
                      if (risk < 0.10) return 'url(#mediumRiskGradient)'
                      return 'url(#highRiskGradient)'
                    }

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.assetId === highlightedAsset ? 'url(#highlightGradient)' : getRiskGradient(entry.dropRisk)}
                        stroke={entry.assetId === highlightedAsset ? '#475569' : 'none'}
                        strokeWidth={entry.assetId === highlightedAsset ? 1.5 : 0}
                        style={{
                          opacity: highlightedAsset && entry.assetId !== highlightedAsset ? 0.25 : 1,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Model Diagnostics - Compact */}
          {modelStats && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-2 gap-2 flex-shrink-0"
            >
              <div className={`${colors.bgCard} rounded-lg border ${colors.border} shadow-sm p-2.5`}>
                <div className={`${colors.textTertiary} text-xs font-medium uppercase tracking-wider mb-1`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', letterSpacing: '0.05em' }}>
                  Accuracy
                </div>
                <div className={`${colors.textPrimary} text-base font-semibold text-emerald-600`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                  {modelStats.accuracy}
                </div>
              </div>
              <div className={`${colors.bgCard} rounded-lg border ${colors.border} shadow-sm p-2.5`}>
                <div className={`${colors.textTertiary} text-xs font-medium uppercase tracking-wider mb-1`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', letterSpacing: '0.05em' }}>
                  Dataset
                </div>
                <div className={`${colors.textPrimary} text-base font-semibold`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                  {modelStats.datasetSize}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN - System Alerts Panel */}
        <div className="flex flex-col h-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
              <h2 className={`${colors.textPrimary} text-sm font-semibold`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                System Alerts
              </h2>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border ${colors.borderSubtle}`}>
                <Clock className="w-3 h-3 text-slate-500" />
                <span className={`${colors.textTertiary} text-xs`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                  3m ago
                </span>
              </div>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-0">
              {insights.map((insight, index) => {
                const config = {
                  warning: {
                    border: 'border-amber-200',
                    bg: 'bg-amber-50/50',
                    iconBg: 'bg-amber-100',
                    iconColor: 'text-amber-600',
                    accent: colors.accentAmber,
                  },
                  growth: {
                    border: 'border-emerald-200',
                    bg: 'bg-emerald-50/50',
                    iconBg: 'bg-emerald-100',
                    iconColor: 'text-emerald-600',
                    accent: colors.accentGreen,
                  },
                  alert: {
                    border: 'border-red-200',
                    bg: 'bg-red-50/50',
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    accent: colors.accentRed,
                  },
                }[insight.type]

                const Icon = insight.type === 'warning' ? AlertTriangle : insight.type === 'growth' ? TrendingUp : TrendingDown
                const isHighlighted = insight.assetId === highlightedAsset

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.03, duration: 0.3, ease: 'easeOut' }}
                    whileHover={{ x: 2 }}
                    onClick={() => handleInsightClick(insight.assetId)}
                    className={`group ${colors.bgCard} rounded-lg border ${isHighlighted ? 'border-slate-400' : config.border} ${config.bg} shadow-sm p-2.5 transition-all duration-200 cursor-pointer hover:shadow-md`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${config.iconBg}`}>
                        <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`${colors.textPrimary} text-xs font-semibold mb-1 line-clamp-1`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                          {insight.title.replace(/[⚠️📈🚨✅]/g, '').trim()}
                        </h4>
                        <p className={`${colors.textSecondary} text-xs leading-relaxed mb-2 line-clamp-2`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`${colors.textTertiary} text-xs font-medium`} style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
                              {insight.confidence}%
                            </span>
                            <div className="w-10 h-1 rounded-full bg-slate-100 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${insight.confidence}%` }}
                                transition={{ delay: 0.3 + index * 0.03, duration: 0.6, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: config.accent }}
                              />
                            </div>
                          </div>
                          <ChevronRight className={`w-3 h-3 ${colors.textTertiary} group-hover:${colors.textSecondary} group-hover:translate-x-0.5 transition-all`} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F1F5F9;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  )
}
