'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Sparkles, Search, Upload, FileText, X } from 'lucide-react'
import ChatPanel from './components/ChatPanel'
import PropertyDiscovery from './components/PropertyDiscovery'
import PredictiveAnalytics from './components/PredictiveAnalytics'
import ChatResponse from './components/ChatResponse'
import DocumentInsights from './components/DocumentInsights'
import InsightSummaryDashboard from './components/InsightSummaryDashboard'
import HomeGreeting from './components/HomeGreeting'
import PromptButtons from './components/PromptButtons'
import ChatInputBar from './components/ChatInputBar'
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

  const handleChatMessage = async (message: string) => {
    // Handle messages from the chat panel
    await handleSearch(message)
  }

  const handleDocumentUpload = async (file: File) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/document', {
        method: 'POST',
        body: formData,
      })

      const responseData = await response.json()

      if (!response.ok) {
        // Show detailed error message
        const errorMsg = responseData.error || 'Failed to process document'
        throw new Error(errorMsg)
      }

      // Map to document view mode with new response structure
      setViewMode('document')
      // The response now has: fileName, numPages, metrics, aiSummary
      // DocumentInsights component will handle both old and new formats
      setResponseData({
        type: 'document_intelligence',
        data: {
          documents: responseData.success ? [{
            fileName: responseData.fileName,
            numPages: responseData.numPages,
            metrics: responseData.metrics,
            aiSummary: responseData.aiSummary,
          }] : [],
          summary: responseData.success ? {
            totalDocuments: 1,
            totalClauses: responseData.metrics.totalClauses,
            expiringSoon: responseData.metrics.expiringSoon ? 1 : 0,
            averageCompliance: responseData.metrics.complianceScore,
            totalMonthlyRent: responseData.metrics.rentAmount,
          } : {},
        },
        // Also pass direct props for new format
        fileName: responseData.fileName,
        numPages: responseData.numPages,
        metrics: responseData.metrics,
        aiSummary: responseData.aiSummary,
      })
    } catch (error) {
      console.error('Error processing document:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to process document. Please try again.'
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'property':
        // PropertyDiscovery already has its own layout with ChatPanel, so we need to extract just the PropertyGrid
        return <PropertyDiscovery data={responseData?.data} />
      case 'analytics':
        return <PredictiveAnalytics data={responseData?.data || {}} />
      case 'document':
        return (
          <DocumentInsights 
            documents={responseData?.data?.documents || []}
            summary={responseData?.data?.summary || {}}
            fileName={responseData?.fileName}
            numPages={responseData?.numPages}
            metrics={responseData?.metrics}
            aiSummary={responseData?.aiSummary}
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
        // For chat view, just show the response content (ChatPanel is always on left)
        return <ChatResponse content={responseData?.content || ''} />
      default:
        return <HomeView onQuickAction={handleQuickAction} onDocumentUpload={handleDocumentUpload} isProcessing={isProcessing} />
    }
  }

  return (
    <div 
      className={`h-screen w-screen overflow-hidden flex flex-col ${
        viewMode !== 'home' 
          ? 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30' 
          : ''
      }`}
      style={viewMode === 'home' ? {
        background: 'radial-gradient(ellipse at center, #0f1014 0%, #1a1c21 100%)',
      } : {}}
    >
      {/* Top Bar - Hidden on home, shown on other views */}
      {viewMode !== 'home' && (
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('home')}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
            >
              Back to Home
            </motion.button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
              JD
            </div>
          </div>
        </motion.header>
      )}

      {/* Home View Top Bar - Minimalist with logo and avatar */}
      {viewMode === 'home' && (
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-10"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-white" />
              <h1 className="text-lg font-semibold text-white font-cbre tracking-tight">CURA</h1>
            </div>
          </div>

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-sm font-semibold backdrop-blur-sm">
            JD
          </div>
        </motion.header>
      )}

      {/* Main Content Area with Persistent Chat Panel */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* Left: Persistent Chat Panel - Show on all pages except home */}
        {viewMode !== 'home' && (
          <ChatPanel onSendMessage={handleChatMessage} isProcessing={isProcessing} />
        )}

        {/* Right: Main Content */}
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
    </div>
  )
}

function HomeView({ 
  onQuickAction, 
  onDocumentUpload,
  isProcessing 
}: { 
  onQuickAction: (action: string) => void
  onDocumentUpload: (file: File) => void
  isProcessing: boolean
}) {
  const handlePromptSelect = (prompt: string) => {
    onQuickAction(prompt)
  }

  const handleInputSubmit = (message: string) => {
    if (message.trim()) {
      onQuickAction(message)
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center overflow-y-auto relative">
      <div className="w-full max-w-5xl px-4 md:px-6 py-12 md:py-20 flex flex-col items-center justify-center min-h-screen">
        {/* Greeting Section */}
        <HomeGreeting userName="Jordan" />

        {/* Prompt Buttons */}
        <PromptButtons onPromptSelect={handlePromptSelect} />

        {/* Chat Input Bar */}
        <div className="w-full mt-8">
          <ChatInputBar 
            onSendMessage={handleInputSubmit}
            placeholder="How can CURA help you today?"
          />
        </div>
      </div>
    </div>
  )
}
