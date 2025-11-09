'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Calendar, DollarSign, AlertCircle, CheckCircle, Shield, Upload, X, Sparkles } from 'lucide-react'

interface DocumentMetrics {
  totalClauses: number
  expiringSoon: boolean
  complianceScore: number
  rentAmount: string
}

interface Document {
  fileName: string
  numPages: number
  metrics: DocumentMetrics
  aiSummary: string
}

interface DocumentInsightsProps {
  documents?: Document[]
  summary?: any
  // For direct API response
  fileName?: string
  numPages?: number
  metrics?: DocumentMetrics
  aiSummary?: string
}

// Animated number component
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const startValueRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    let startTime: number | null = null
    const duration = 1500 // 1.5 seconds
    const startValue = startValueRef.current
    const endValue = value

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime!) / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(startValue + (endValue - startValue) * easeOut)
      
      setDisplayValue(current)
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
        startValueRef.current = endValue
        animationFrameRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [value])

  // Update ref when value changes
  useEffect(() => {
    if (displayValue === value) {
      startValueRef.current = value
    }
  }, [displayValue, value])

  return <span>{displayValue}{suffix}</span>
}

// Loading shimmer component
function LoadingShimmer() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-[#111513]/40 rounded-xl h-24 border border-[#1E3028]" />
        ))}
      </div>
      <div className="bg-[#111513]/40 rounded-xl h-32 border border-[#1E3028]" />
    </div>
  )
}

export default function DocumentInsights(props: DocumentInsightsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Initialize documents from props
  useEffect(() => {
    if (props.documents && props.documents.length > 0) {
      setDocuments(props.documents)
    } else if (props.fileName && props.metrics) {
      // Single document from direct API response
      setDocuments([{
        fileName: props.fileName,
        numPages: props.numPages || 0,
        metrics: props.metrics,
        aiSummary: props.aiSummary || '',
      }])
    }
  }, [props])

  // Calculate aggregate metrics
  const aggregateMetrics = documents.length > 0 ? {
    totalDocuments: documents.length,
    totalClauses: Math.round(documents.reduce((sum, doc) => sum + doc.metrics.totalClauses, 0) / documents.length),
    expiringSoon: documents.filter(doc => doc.metrics.expiringSoon).length,
    averageCompliance: Math.round(documents.reduce((sum, doc) => sum + doc.metrics.complianceScore, 0) / documents.length),
    totalMonthlyRent: documents.find(doc => doc.metrics.rentAmount !== 'N/A')?.metrics.rentAmount || 'N/A',
  } : {
    totalDocuments: 0,
    totalClauses: 0,
    expiringSoon: 0,
    averageCompliance: 0,
    totalMonthlyRent: 'N/A',
  }

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setUploadedFile(file)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process document')
      }

      const data = await response.json()
      
      // Add new document to the list
      const newDocument: Document = {
        fileName: data.fileName,
        numPages: data.numPages,
        metrics: data.metrics,
        aiSummary: data.aiSummary,
      }

      setDocuments(prev => [...prev, newDocument])
    } catch (error) {
      console.error('Error uploading document:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload document')
    } finally {
      setIsLoading(false)
      setUploadedFile(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0])
    }
  }

  const getComplianceColor = (score: number) => {
    if (score >= 80) return 'text-[#00A86B]'
    if (score >= 50) return 'text-[#88C999]'
    return 'text-red-400'
  }

  const getComplianceBgColor = (score: number) => {
    if (score >= 80) return 'bg-[#00A86B]/10 border-[#00A86B]/40'
    if (score >= 50) return 'bg-[#88C999]/10 border-[#88C999]/40'
    return 'bg-red-500/10 border-red-500/40'
  }

  // Show loading state
  if (isLoading && documents.length === 0) {
    return (
      <div className="h-full w-full p-8">
        <div className="max-w-7xl mx-auto">
          <LoadingShimmer />
        </div>
      </div>
    )
  }

  // Show empty state
  if (documents.length === 0 && !isLoading) {
    return (
      <div className="h-full w-full p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-200 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.4)]">
              <FileText size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white font-cbre mb-2">Document Intelligence</h2>
              <p className="text-[#B7C4B8] mb-6">Upload a PDF to analyze lease agreements, contracts, or reports</p>
            </div>
            <label className="inline-flex items-center gap-3 px-6 py-4 bg-[#111513]/60 backdrop-blur-xl rounded-xl border-2 border-dashed border-[#1E3028] hover:border-[#00A86B]/50 cursor-pointer transition-colors shadow-sm">
              <Upload size={24} className="text-[#B7C4B8]" />
              <span className="text-[#C9E3D5] font-medium">Upload PDF Document</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </motion.div>
        </div>
      </div>
    )
  }

  const latestDocument = documents[documents.length - 1]
  const summary = latestDocument?.aiSummary || ''

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-200 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <FileText size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white font-cbre">Document Intelligence</h2>
                <p className="text-sm text-[#B7C4B8] mt-1">
                  {documents.length} document{documents.length !== 1 ? 's' : ''} analyzed
                </p>
              </div>
            </div>
            
            {/* Upload Button */}
            <label className="flex items-center gap-2 px-4 py-2 bg-[#111513]/60 backdrop-blur-xl rounded-lg border border-[#1E3028] hover:border-[#00A86B]/50 cursor-pointer transition-colors shadow-sm">
              <Upload size={18} className="text-[#B7C4B8]" />
              <span className="text-sm font-medium text-[#C9E3D5]">Upload</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>

          {/* Loading indicator for new uploads */}
          {isLoading && uploadedFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-4 bg-[#00A86B]/10 border border-[#00A86B]/40 rounded-lg flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-[#00A86B] border-t-transparent rounded-full"
              />
              <span className="text-sm text-[#00A86B]">Processing {uploadedFile.name}...</span>
            </motion.div>
          )}
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* Total Documents */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111513]/60 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-[#1E3028] hover:shadow-md hover:border-[#00A86B]/40 transition-shadow"
          >
            <div className="text-xs font-medium text-[#B7C4B8] mb-2 uppercase tracking-wide">Total Documents</div>
            <div className="text-3xl font-bold text-white">
              <AnimatedNumber value={aggregateMetrics.totalDocuments} />
            </div>
          </motion.div>

          {/* Expiring Soon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111513]/60 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-[#88C999]/40 hover:shadow-md transition-shadow"
          >
            <div className="text-xs font-medium text-[#B7C4B8] mb-2 uppercase tracking-wide">Expiring Soon</div>
            <div className="text-3xl font-bold text-[#88C999]">
              <AnimatedNumber value={aggregateMetrics.expiringSoon} />
            </div>
          </motion.div>

          {/* Avg Compliance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`bg-[#111513]/60 backdrop-blur-xl rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow ${getComplianceBgColor(aggregateMetrics.averageCompliance)}`}
          >
            <div className="text-xs font-medium text-[#B7C4B8] mb-2 uppercase tracking-wide">Avg Compliance</div>
            <div className={`text-3xl font-bold ${getComplianceColor(aggregateMetrics.averageCompliance)}`}>
              <AnimatedNumber value={aggregateMetrics.averageCompliance} suffix="%" />
            </div>
          </motion.div>

          {/* Total Clauses */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#111513]/60 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-[#1E3028] hover:shadow-md hover:border-[#00A86B]/40 transition-shadow"
          >
            <div className="text-xs font-medium text-[#B7C4B8] mb-2 uppercase tracking-wide">Total Clauses</div>
            <div className="text-3xl font-bold text-white">
              <AnimatedNumber value={aggregateMetrics.totalClauses} />
            </div>
          </motion.div>

          {/* Monthly Rent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-[#111513]/60 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-[#00A86B]/40 hover:shadow-md transition-shadow"
          >
            <div className="text-xs font-medium text-[#B7C4B8] mb-2 uppercase tracking-wide">Monthly Rent</div>
            <div className="text-3xl font-bold text-[#00A86B]">
              {aggregateMetrics.totalMonthlyRent}
            </div>
          </motion.div>
        </div>

        {/* AI Summary */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 p-6 bg-gradient-to-r from-[#00A86B]/10 to-[#88C999]/10 rounded-xl border border-[#00A86B]/40 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-[#00A86B] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 font-cbre">AI Insights</h3>
                <p className="text-[#C9E3D5] leading-relaxed">{summary}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Document Details */}
        <div className="space-y-6">
          <AnimatePresence>
            {documents.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111513]/60 backdrop-blur-xl rounded-xl p-6 shadow-sm border border-[#1E3028]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-200 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                      <FileText size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 font-cbre">{doc.fileName}</h3>
                      <p className="text-sm text-[#B7C4B8]">{doc.numPages} pages</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getComplianceBgColor(doc.metrics.complianceScore)}`}>
                    <Shield size={16} className={getComplianceColor(doc.metrics.complianceScore)} />
                    <span className={`text-sm font-semibold ${getComplianceColor(doc.metrics.complianceScore)}`}>
                      {doc.metrics.complianceScore}%
                    </span>
                  </div>
                </div>

                {/* Document Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 bg-[#111513]/40 rounded-lg border border-[#1E3028]">
                    <div className="text-xs font-medium text-[#B7C4B8] mb-1">Clauses</div>
                    <div className="text-xl font-bold text-white">{doc.metrics.totalClauses}</div>
                  </div>
                  <div className="p-4 bg-[#111513]/40 rounded-lg border border-[#1E3028]">
                    <div className="text-xs font-medium text-[#B7C4B8] mb-1">Monthly Rent</div>
                    <div className="text-xl font-bold text-[#00A86B]">{doc.metrics.rentAmount}</div>
                  </div>
                  <div className="p-4 bg-[#111513]/40 rounded-lg border border-[#1E3028]">
                    <div className="text-xs font-medium text-[#B7C4B8] mb-1">Status</div>
                    <div className="text-xl font-bold text-white">
                      {doc.metrics.expiringSoon ? (
                        <span className="text-[#88C999]">Expiring Soon</span>
                      ) : (
                        <span className="text-[#00A86B]">Active</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-[#111513]/40 rounded-lg border border-[#1E3028]">
                    <div className="text-xs font-medium text-[#B7C4B8] mb-1">Compliance</div>
                    <div className={`text-xl font-bold ${getComplianceColor(doc.metrics.complianceScore)}`}>
                      {doc.metrics.complianceScore}%
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
