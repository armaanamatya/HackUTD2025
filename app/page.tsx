'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Search, Sparkles } from 'lucide-react'
import PropertyDiscovery from './components/PropertyDiscovery'
import AnalyticsView from './components/AnalyticsView'
import ChatResponse from './components/ChatResponse'
import DocumentInsights from './components/DocumentInsights'
import InsightSummaryDashboard from './components/InsightSummaryDashboard'
import { AgentCard } from './types'

type ViewMode = 'home' | 'property' | 'analytics' | 'chat' | 'document' | 'insights'

export default function Home() {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [responseData, setResponseData] = useState<any>(null)

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim() || isProcessing) return

    setIsProcessing(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery }),
      })

      const data = await response.json()

      // Map API response type to view mode
      const modeMap: Record<string, ViewMode> = {
        'property_discovery': 'property',
        'predictive_analytics': 'analytics',
        'document_intelligence': 'document',
        'insight_summarizer': 'insights',
        'smart_search': 'chat',
      }

      setViewMode(modeMap[data.type] || 'chat')
      setResponseData(data)
      setQuery('')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickAction = (action: string) => {
    setQuery(action)
    handleSearch(action)
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'property':
        return <PropertyDiscovery data={responseData?.data} />
      case 'analytics':
        return (
          <AnalyticsView 
            metrics={responseData?.data?.metrics || []} 
            chartData={responseData?.data?.chartData || []}
            chartType={responseData?.data?.chartType}
            insights={responseData?.data?.insights}
          />
        )
      case 'document':
        return (
          <DocumentInsights 
            documents={responseData?.data?.documents || []}
            summary={responseData?.data?.summary || {}}
          />
        )
      case 'insights':
        return (
          <InsightSummaryDashboard 
            kpis={responseData?.data?.kpis || []}
            topInsights={responseData?.data?.topInsights || []}
            recommendations={responseData?.data?.recommendations || []}
            chartData={responseData?.data?.chartData}
          />
        )
      case 'chat':
        return <ChatResponse content={responseData?.content || ''} />
      default:
        return <HomeView onQuickAction={handleQuickAction} />
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30">
      {/* Top Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 px-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl flex items-center justify-between shadow-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CURA</h1>
            <p className="text-xs text-gray-500">Agentic AI Workspace</p>
          </div>
        </div>

        {/* Search Bar - Only show if not on home */}
        {viewMode !== 'home' && (
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask CURA anything..."
                className="w-full px-4 py-2.5 pl-11 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                disabled={isProcessing}
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {viewMode !== 'home' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('home')}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
            >
              Back to Home
            </motion.button>
          )}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
            JD
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function HomeView({ onQuickAction }: { onQuickAction: (action: string) => void }) {
  const quickActions = [
    {
      title: 'Property Discovery',
      description: 'Search and explore real estate listings',
      icon: '🏠',
      action: 'show me properties in Jakarta',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      title: 'Predictive Analytics',
      description: 'Forecast trends and performance metrics',
      icon: '📊',
      action: 'predict next quarter performance',
      gradient: 'from-purple-500 to-pink-400',
    },
    {
      title: 'Document Intelligence',
      description: 'Extract insights from contracts and reports',
      icon: '📄',
      action: 'analyze lease contracts',
      gradient: 'from-orange-500 to-red-400',
    },
    {
      title: 'Insight Summary',
      description: 'Comprehensive portfolio overview',
      icon: '✨',
      action: 'summarize all insights',
      gradient: 'from-green-500 to-emerald-400',
    },
  ]

  return (
    <div className="h-full flex items-center justify-center p-12">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-green-500 flex items-center justify-center shadow-2xl">
              <Sparkles size={48} className="text-white" />
            </div>
          </motion.div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to CURA
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your intelligent AI workspace that adapts to your needs. Ask me anything about real estate, analytics, or insights.
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onQuickAction(action.action)}
              className="group relative bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all text-left overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${action.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
              <div className="relative">
                <div className="text-5xl mb-4">{action.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Or type your query here..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  onQuickAction(e.currentTarget.value)
                }
              }}
              className="w-full px-6 py-5 pl-14 rounded-2xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-base shadow-lg"
            />
            <Search size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Try: "show me houses in Dallas" • "predict market trends" • "analyze contracts"
          </p>
        </motion.div>
      </div>
    </div>
  )
}
