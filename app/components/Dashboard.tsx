'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Users, ArrowUpRight, ArrowDownRight, BarChart3, FileText, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import InlineAIButton from './InlineAIButton'

interface DashboardProps {
  currentTask?: string | null
  setCurrentTask?: (task: string | null) => void
  onInlineQuestion?: (question: string) => void
}

const metricCards = [
  {
    id: 1,
    title: 'Total Value',
    value: '$2.4B',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'cbre-green',
    context: 'total portfolio value metric',
  },
  {
    id: 2,
    title: 'Expenses',
    value: '$48.2M',
    change: '-3.2%',
    trend: 'down',
    icon: TrendingUp,
    color: 'cbre-teal',
    context: 'expenses metric',
  },
  {
    id: 3,
    title: 'Occupancy',
    value: '94.2%',
    change: '+2.1%',
    trend: 'up',
    icon: Users,
    color: 'cbre-green',
    context: 'occupancy rate metric',
  },
]

const marketData = [
  { month: 'Jan', value: 2400 },
  { month: 'Feb', value: 2100 },
  { month: 'Mar', value: 2800 },
  { month: 'Apr', value: 3200 },
  { month: 'May', value: 2900 },
  { month: 'Jun', value: 3500 },
  { month: 'Jul', value: 3800 },
  { month: 'Aug', value: 4200 },
]

const propertyInsights = [
  {
    id: 1,
    name: 'Plano HQ',
    growth: '+12%',
    risk: 'low',
    riskColor: 'text-green-600',
    context: 'Plano HQ property',
  },
  {
    id: 2,
    name: 'Dallas Tower',
    growth: '+8%',
    risk: 'medium',
    riskColor: 'text-yellow-600',
    context: 'Dallas Tower property',
  },
  {
    id: 3,
    name: 'Austin Complex',
    growth: '+15%',
    risk: 'low',
    riskColor: 'text-green-600',
    context: 'Austin Complex property',
  },
]

export default function Dashboard({ currentTask, onInlineQuestion }: DashboardProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  if (currentTask === 'visualize') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="glass rounded-2xl p-8 border border-cbre-gray-200 shadow-glass text-center relative group">
          <BarChart3 size={48} className="text-cbre-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cbre-gray-900 mb-2">Creating Visualizations</h2>
          <p className="text-cbre-gray-600">Generating charts and graphs based on your data...</p>
          {onInlineQuestion && <InlineAIButton context="visualization" onAsk={onInlineQuestion} />}
        </div>
        <div className="glass rounded-2xl p-6 border border-cbre-gray-200 shadow-glass relative group">
          <h2 className="text-xl font-bold text-cbre-gray-900 mb-6">Market Value Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={marketData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A25A" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00FFC8" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="url(#colorValue)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {onInlineQuestion && <InlineAIButton context="market trends chart" onAsk={onInlineQuestion} />}
        </div>
      </motion.div>
    )
  }

  if (currentTask === 'analyze') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="glass rounded-2xl p-8 border border-cbre-gray-200 shadow-glass text-center relative group">
          <Sparkles size={48} className="text-cbre-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cbre-gray-900 mb-2">Running Analysis</h2>
          <p className="text-cbre-gray-600">Analyzing your property portfolio for insights...</p>
          {onInlineQuestion && <InlineAIButton context="analysis results" onAsk={onInlineQuestion} />}
        </div>
        <div className="grid grid-cols-2 gap-6">
          {propertyInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl p-6 border border-cbre-gray-200 shadow-glass relative group"
              onMouseEnter={() => setHoveredCard(insight.id.toString())}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h3 className="font-semibold text-lg text-cbre-gray-900 mb-2">{insight.name}</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-cbre-gray-500">Growth</span>
                <span className="text-lg font-bold text-cbre-green">{insight.growth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-cbre-gray-500">Risk Level</span>
                <span className={`text-sm font-medium ${insight.riskColor}`}>{insight.risk}</span>
              </div>
              {onInlineQuestion && hoveredCard === insight.id.toString() && (
                <InlineAIButton context={insight.context} onAsk={onInlineQuestion} />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (currentTask === 'report') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="glass rounded-2xl p-8 border border-cbre-gray-200 shadow-glass text-center relative group">
          <FileText size={48} className="text-cbre-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cbre-gray-900 mb-2">Generating Report</h2>
          <p className="text-cbre-gray-600">Compiling comprehensive property analysis report...</p>
          {onInlineQuestion && <InlineAIButton context="report" onAsk={onInlineQuestion} />}
        </div>
        <div className="glass rounded-2xl p-6 border border-cbre-gray-200 shadow-glass relative group">
          <h2 className="text-xl font-bold text-cbre-gray-900 mb-4">Executive Summary</h2>
          <div className="space-y-4">
            <div className="p-4 bg-cbre-gray-50 rounded-lg">
              <h3 className="font-semibold text-cbre-gray-900 mb-2">Portfolio Performance</h3>
              <p className="text-sm text-cbre-gray-600">Total portfolio value increased by 12.5% this quarter, driven by strong performance in office assets.</p>
            </div>
            <div className="p-4 bg-cbre-gray-50 rounded-lg">
              <h3 className="font-semibold text-cbre-gray-900 mb-2">Key Recommendations</h3>
              <ul className="text-sm text-cbre-gray-600 space-y-1 list-disc list-inside">
                <li>Review 3 leases expiring in Q2</li>
                <li>Address energy inefficiency risks in Dallas properties</li>
                <li>Consider expansion opportunities in Austin market</li>
              </ul>
            </div>
          </div>
          {onInlineQuestion && <InlineAIButton context="executive summary" onAsk={onInlineQuestion} />}
        </div>
      </motion.div>
    )
  }

  // Default dashboard view
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon
          const iconBgClass = card.color === 'cbre-green' ? 'bg-cbre-green/10' : 'bg-cbre-teal/10'
          const iconColorClass = card.color === 'cbre-green' ? 'text-cbre-green' : 'text-cbre-teal'
          return (
            <motion.div
              key={card.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass rounded-2xl p-6 border border-cbre-gray-200 shadow-glass relative group"
              onMouseEnter={() => setHoveredCard(card.id.toString())}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${iconBgClass}`}>
                  <Icon size={24} className={iconColorClass} />
                </div>
                {card.trend === 'up' ? (
                  <ArrowUpRight size={20} className="text-cbre-green" />
                ) : (
                  <ArrowDownRight size={20} className="text-cbre-teal" />
                )}
              </div>
              <h3 className="text-sm font-medium text-cbre-gray-500 mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-cbre-gray-900 mb-2">{card.value}</p>
              <p className={`text-sm font-medium ${
                card.trend === 'up' ? 'text-cbre-green' : 'text-cbre-teal'
              }`}>
                {card.change} from last quarter
              </p>
              {onInlineQuestion && hoveredCard === card.id.toString() && (
                <InlineAIButton context={card.context} onAsk={onInlineQuestion} />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Charts and Insights Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Market Value Trends Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 glass rounded-2xl p-6 border border-cbre-gray-200 shadow-glass relative group"
          onMouseEnter={() => setHoveredCard('chart')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h2 className="text-xl font-bold text-cbre-gray-900 mb-6">Market Value Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marketData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A25A" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00FFC8" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="url(#colorValue)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {onInlineQuestion && hoveredCard === 'chart' && (
            <InlineAIButton context="market value trends chart" onAsk={onInlineQuestion} />
          )}
        </motion.div>

        {/* Property Insights */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-cbre-gray-900 mb-4">Property Insights</h2>
          {propertyInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ x: 4 }}
              className="glass rounded-xl p-4 border border-cbre-gray-200 shadow-glass relative group"
              onMouseEnter={() => setHoveredCard(`insight-${insight.id}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-cbre-gray-900">{insight.name}</h3>
                <span className="text-sm font-bold text-cbre-green">{insight.growth}</span>
              </div>
              <p className="text-sm text-cbre-gray-500">
                Growth • <span className={insight.riskColor}>Risk: {insight.risk}</span>
              </p>
              {onInlineQuestion && hoveredCard === `insight-${insight.id}` && (
                <InlineAIButton context={insight.context} onAsk={onInlineQuestion} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
