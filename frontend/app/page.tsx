'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Sparkles, Search, Upload, FileText, X } from 'lucide-react'
import ChatPanel from './components/ChatPanel'
import PropertyDiscovery from './components/PropertyDiscovery'
import PredictiveAnalytics from './components/PredictiveAnalytics'
import { useChatStore } from './stores/chatStore'
import DocumentInsights from './components/DocumentInsights'
import InsightSummaryDashboard from './components/InsightSummaryDashboard'
import HomeGreeting from './components/HomeGreeting'
import PromptButtons from './components/PromptButtons'
import ChatInputBar from './components/ChatInputBar'
import ChatResponse from './components/ChatResponse'
import { AgentCard } from './types'
import { crewaiService, JobResponse } from './services/crewaiService'

// Logging utility
const log = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    console.log(`[FRONTEND-MAIN] ${timestamp} | INFO | ${message}`, data || '')
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString()
    console.error(`[FRONTEND-MAIN] ${timestamp} | ERROR | ${message}`, error || '')
  }
}

type ViewMode = 'home' | 'property' | 'analytics' | 'document' | 'insights' | 'chat'

export default function Home() {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [responseData, setResponseData] = useState<any>(null)
  const [currentJob, setCurrentJob] = useState<JobResponse | null>(null)
  const [crewaiResponse, setCrewaiResponse] = useState<string>('')
  
  // Get chat store functions
  const { addMessage, setIsProcessing: setStoreProcessing } = useChatStore()

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim() || isProcessing) return

    setIsProcessing(true)
    setStoreProcessing(true)

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
      }

      // Add assistant response to chat store
      if (data.content || data.type === 'smart_search') {
        const responseText = data.content || `I've processed your request and updated the ${data.type || 'results'} view.`
        addMessage('assistant', responseText)
      } else {
        // For structured responses, add a contextual message
        const responseText = `I've analyzed your query and prepared the ${modeMap[data.type] || 'results'} view for you.`
        addMessage('assistant', responseText)
      }

      setViewMode(modeMap[data.type] || 'home')
      setResponseData(data)
      setQuery('')
    } catch (error) {
      console.error('Error:', error)
      addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.')
    } finally {
      setIsProcessing(false)
      setStoreProcessing(false)
    }
  }

  const handleQuickAction = (action: string) => {
    setQuery(action)
    handleSearch(action)
  }

  const handleCrewAIQuery = async (query: string) => {
    setIsProcessing(true)
    setViewMode('chat')
    
    try {
      // Start the CrewAI job
      const job = await crewaiService.startJob(query)
      setCurrentJob(job)
      setCrewaiResponse('Your request is being processed by our AI agents...')
      
      // Poll for completion
      const completedJob = await crewaiService.pollJobCompletion(
        job.job_id,
        (statusUpdate) => {
          setCurrentJob(statusUpdate)
          if (statusUpdate.status === 'running') {
            setCrewaiResponse('AI agents are working on your request...')
          }
        }
      )
      
      // Set the final result
      setCrewaiResponse(completedJob.result || 'Request completed successfully')
      setCurrentJob(completedJob)
      
    } catch (error) {
      console.error('CrewAI Error:', error)
      setCrewaiResponse(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleChatMessage = async (message: string) => {
    // Check if this should go to CrewAI or existing agent system
    const crewaiKeywords = ['research', 'analyze', 'plan', 'project', 'study', 'investigate', 'examine']
    const shouldUseCrewAI = crewaiKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )
    
    if (shouldUseCrewAI) {
      await handleCrewAIQuery(message)
    } else {
      await handleSearch(message)
    }
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
        // For chat view, show either CrewAI response or regular agent response
        const chatContent = crewaiResponse || responseData?.content || ''
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {currentJob && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                      Job Status: {currentJob.status}
                    </span>
                    <span className="text-xs text-blue-600">
                      ID: {currentJob.job_id}
                    </span>
                  </div>
                  {currentJob.status === 'running' && (
                    <div className="mt-2">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <ChatResponse content={chatContent} />
            </div>
          </div>
        )
      default:
        return <HomeView onQuickAction={handleQuickAction} onCrewAIQuery={handleCrewAIQuery} onDocumentUpload={handleDocumentUpload} isProcessing={isProcessing} />
    }
  }

  return (
    <div 
      className="h-screen w-screen overflow-hidden flex flex-col"
      style={{
        background: 'radial-gradient(circle at top, #0B0E0C 0%, #111513 100%)',
      }}
    >
      {/* Top Bar - Consistent dark theme for all views */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`h-16 px-6 border-b border-[#1E3028] bg-[#111513]/60 backdrop-blur-xl flex items-center justify-between ${
          viewMode === 'home' ? 'absolute top-0 left-0 right-0 z-10 border-transparent' : 'relative'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-[#00A86B]" />
            <h1 className="text-lg font-semibold text-white font-cbre tracking-tight">CURA</h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {viewMode !== 'home' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('home')}
              className="px-4 py-2 rounded-md bg-[#111513]/60 border border-[#1E3028] hover:bg-[#00A86B]/10 hover:border-[#00A86B]/40 text-sm font-medium text-[#B7C4B8] hover:text-white transition-all duration-300"
            >
              Back to Home
            </motion.button>
          )}
          <div className="w-9 h-9 rounded-full bg-[#111513]/60 border border-[#1E3028] flex items-center justify-center text-white text-sm font-semibold backdrop-blur-sm">
            JD
          </div>
        </div>
      </motion.header>


      {/* Main Content Area with Persistent Chat Panel */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* Left: Persistent Chat Panel - Show on all pages except home */}
        {viewMode !== 'home' && (
          <ChatPanel onSendMessage={(message) => handleChatMessage(message)} isProcessing={isProcessing} />
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
  onCrewAIQuery,
  onDocumentUpload,
  isProcessing 
}: { 
  onQuickAction: (action: string) => void
  onCrewAIQuery: (query: string, files?: any[]) => Promise<void>
  onDocumentUpload: (file: File) => void
  isProcessing: boolean
}) {
  const handlePromptSelect = (prompt: string) => {
    onQuickAction(prompt)
  }

  const handleInputSubmit = async (message: string, files?: any[]) => {
    if (message.trim() || (files && files.length > 0)) {
      // Check if this should go to CrewAI or existing agent system
      const crewaiKeywords = ['research', 'analyze', 'plan', 'project', 'study', 'investigate', 'examine']
      const shouldUseCrewAI = crewaiKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      ) || (files && files.length > 0) // Always use CrewAI if files are present
      
      log.info('Home input submitted', {
        messageLength: message.length,
        hasFiles: !!(files && files.length > 0),
        fileCount: files?.length || 0,
        shouldUseCrewAI,
        matchedKeywords: crewaiKeywords.filter(keyword => message.toLowerCase().includes(keyword))
      })
      
      if (shouldUseCrewAI) {
        await onCrewAIQuery(message, files)
      } else {
        onQuickAction(message)
      }
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

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="text-xs text-[#B7C4B8]/50 mt-12 md:mt-16"
        >
          Powered by <span className="text-[#00A86B] font-medium">CURA • CBRE</span>
        </motion.p>
      </div>
    </div>
  )
}
