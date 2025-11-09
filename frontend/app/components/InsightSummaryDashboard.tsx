'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Lightbulb, Target, BarChart3 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface InsightSummaryDashboardProps {
  kpis: any[]
  topInsights: string[]
  recommendations: string[]
  chartData?: any[]
  pros?: string[]
  cons?: string[]
  title?: string
  subtitle?: string
  property?: any
  property1?: any
  property2?: any
}

export default function InsightSummaryDashboard({ kpis, topInsights, recommendations, chartData, pros, cons, title, subtitle, property, property1, property2 }: InsightSummaryDashboardProps) {
  const hasProsCons = pros && cons && (pros.length > 0 || cons.length > 0)
  const isComparison = property1 && property2
  const isSingleProperty = property && !isComparison
  const displayTitle = title || (isComparison ? 'Property Comparison' : isSingleProperty ? 'Property Analysis' : 'Insight Summary Dashboard')
  const displaySubtitle = subtitle || (isComparison ? 'Detailed comparison between two properties' : isSingleProperty ? 'Property-specific pros and cons analysis' : hasProsCons ? 'Comprehensive pros and cons analysis for your property investment' : 'Consolidated view across all data sources')
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-200 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <Lightbulb size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white font-cbre">{displayTitle}</h2>
          <p className="text-sm text-[#B7C4B8] font-cbre">{displaySubtitle}</p>
        </div>
      </div>

      {/* Property Info Banner for Single Property */}
      {isSingleProperty && property && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#00A86B]/10 border border-[#00A86B]/30 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white font-cbre mb-1">{property.address || 'Property Details'}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-[#B7C4B8]">
                {property.city && <span>📍 {property.city}{property.state ? `, ${property.state}` : ''}</span>}
                {property.property_type && <span>🏠 {property.property_type}</span>}
                {property.bedrooms && <span>🛏️ {property.bedrooms} beds</span>}
                {property.bathrooms && <span>🚿 {property.bathrooms} baths</span>}
                {property.square_footage && <span>📐 {property.square_footage.toLocaleString()} sqft</span>}
              </div>
            </div>
            {property.listing_price && (
              <div className="text-right">
                <div className="text-2xl font-bold text-[#00A86B] font-cbre">${property.listing_price.toLocaleString()}</div>
                {property.square_footage && (
                  <div className="text-xs text-[#B7C4B8]">${Math.round(property.listing_price / property.square_footage)}/sqft</div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Property Comparison Banner */}
      {isComparison && property1 && property2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-[#00A86B]/10 border border-[#00A86B]/30 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-[#00A86B] mb-2 font-cbre">Property 1</h4>
            <h3 className="text-base font-semibold text-white font-cbre mb-2">{property1.address || 'Property 1'}</h3>
            <div className="space-y-1 text-sm text-[#B7C4B8]">
              {property1.city && <div>📍 {property1.city}{property1.state ? `, ${property1.state}` : ''}</div>}
              {property1.listing_price && <div>💰 ${property1.listing_price.toLocaleString()}</div>}
              {property1.square_footage && <div>📐 {property1.square_footage.toLocaleString()} sqft</div>}
              {property1.bedrooms && property1.bathrooms && <div>🛏️ {property1.bedrooms} beds, {property1.bathrooms} baths</div>}
            </div>
          </div>
          <div className="bg-[#88C999]/10 border border-[#88C999]/30 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-[#88C999] mb-2 font-cbre">Property 2</h4>
            <h3 className="text-base font-semibold text-white font-cbre mb-2">{property2.address || 'Property 2'}</h3>
            <div className="space-y-1 text-sm text-[#B7C4B8]">
              {property2.city && <div>📍 {property2.city}{property2.state ? `, ${property2.state}` : ''}</div>}
              {property2.listing_price && <div>💰 ${property2.listing_price.toLocaleString()}</div>}
              {property2.square_footage && <div>📐 {property2.square_footage.toLocaleString()} sqft</div>}
              {property2.bedrooms && property2.bathrooms && <div>🛏️ {property2.bedrooms} beds, {property2.bathrooms} baths</div>}
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Grid */}
      {kpis && kpis.length > 0 && (
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
              <div className="text-xs text-[#B7C4B8] mb-2 font-cbre uppercase line-clamp-1">{kpi.label}</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 font-cbre line-clamp-1">{kpi.value}</div>
              {kpi.change && <div className="text-sm text-[#00A86B] font-semibold font-cbre line-clamp-1">{kpi.change}</div>}
            </motion.div>
          ))}
        </div>
      )}

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

      {/* Pros and Cons Section */}
      {hasProsCons && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl p-6 border border-[#00A86B]/40 shadow-[0_0_15px_rgba(0,168,107,0.2)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#00A86B]/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-[#00A86B]" />
              </div>
              <h3 className="text-lg font-semibold text-white font-cbre">Pros</h3>
            </div>
            <div className="space-y-3">
              {pros.map((pro, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-[#00A86B]/5 rounded-lg border border-[#00A86B]/20"
                >
                  <div className="w-5 h-5 rounded-full bg-[#00A86B]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#00A86B]">✓</span>
                  </div>
                  <p className="text-sm text-[#C9E3D5] flex-1">{pro}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl p-6 border border-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-[#EF4444] rotate-180" />
              </div>
              <h3 className="text-lg font-semibold text-white font-cbre">Cons</h3>
            </div>
            <div className="space-y-3">
              {cons.map((con, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-[#EF4444]/5 rounded-lg border border-[#EF4444]/20"
                >
                  <div className="w-5 h-5 rounded-full bg-[#EF4444]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#EF4444]">✗</span>
                  </div>
                  <p className="text-sm text-[#C9E3D5] flex-1">{con}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Insights */}
      {topInsights && topInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: hasProsCons ? 0.8 : 0.6 }}
          className="bg-[#111513]/60 backdrop-blur-xl rounded-2xl p-6 border border-[#1E3028]"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={20} className="text-[#00A86B]" />
            <h3 className="text-lg font-semibold text-white font-cbre">Key Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (hasProsCons ? 0.9 : 0.7) + index * 0.1 }}
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
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: hasProsCons ? 1.0 : 0.9 }}
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
                transition={{ delay: (hasProsCons ? 1.1 : 1.0) + index * 0.1 }}
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
      )}
    </motion.div>
  )
}
