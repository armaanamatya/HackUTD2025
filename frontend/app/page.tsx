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
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localQuery, setLocalQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      title: 'Insight Summary',
      description: 'Comprehensive portfolio overview',
      icon: '✨',
      action: 'summarize all insights',
      gradient: 'from-green-500 to-emerald-400',
    },
  ]

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'text/plain']
    const validExtensions = ['pdf', 'txt']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      alert('Please upload a PDF or TXT file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    onDocumentUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-12 overflow-y-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

        {/* Search Textbox with Integrated Document Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 transition-all ${
              isDragging
                ? 'border-orange-500 bg-orange-50/30 border-solid shadow-lg'
                : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
            } ${isProcessing ? 'opacity-60' : ''}`}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              id="document-upload"
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileInputChange}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              disabled={isProcessing}
              aria-label="Upload document"
            />

            {/* Search/Query Input Area */}
            <div className="relative flex items-center gap-3 p-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type your query here or upload a document..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value && !selectedFile && !isProcessing) {
                      onQuickAction(e.currentTarget.value)
                      setLocalQuery('')
                    }
                  }}
                  className="w-full px-6 py-4 pl-14 pr-12 rounded-xl bg-transparent border-0 focus:outline-none text-base placeholder-gray-400"
                  disabled={isProcessing}
                />
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                
                {/* Selected file indicator */}
                {selectedFile && !isProcessing && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
                    <FileText size={16} className="text-orange-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 font-medium truncate max-w-[120px]">{selectedFile.name}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedFile(null)
                        setLocalQuery('')
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="p-0.5 hover:bg-orange-100 rounded transition-colors flex-shrink-0"
                      aria-label="Remove file"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label
                htmlFor="document-upload"
                className={`flex-shrink-0 p-3 rounded-xl transition-all cursor-pointer ${
                  isDragging
                    ? 'bg-orange-500 text-white scale-110'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                title="Upload document (PDF or TXT)"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Upload size={20} className="text-orange-500" />
                  </motion.div>
                ) : (
                  <Upload size={20} />
                )}
              </label>

              {/* Search/Process Button */}
              {localQuery.trim() && !selectedFile && !isProcessing && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    onQuickAction(localQuery)
                    setLocalQuery('')
                  }}
                  className="flex-shrink-0 px-6 py-3 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Search
                </motion.button>
              )}
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"
                  />
                  <p className="text-sm font-medium text-gray-700">Processing document...</p>
                  <p className="text-xs text-gray-500 mt-1">Extracting text and analyzing content</p>
                </div>
              </div>
            )}

            {/* Drag and drop indicator */}
            {isDragging && (
              <div className="absolute inset-0 bg-orange-500/10 rounded-2xl flex items-center justify-center z-20 pointer-events-none">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <Upload size={32} className="text-orange-500" />
                  </div>
                  <p className="text-lg font-semibold text-orange-600">Drop your document here</p>
                  <p className="text-sm text-gray-600 mt-1">PDF or TXT files supported</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <span>Try: "show me houses in Dallas"</span>
            <span>•</span>
            <span>"predict market trends"</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Upload size={14} />
              <span>Upload a document</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
