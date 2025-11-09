'use client'

import { motion } from 'framer-motion'
import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Send, Lock, ChevronDown, Paperclip, X, FileText } from 'lucide-react'

// Logging utility
const log = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    console.log(`[FRONTEND-CHAT] ${timestamp} | INFO | ${message}`, data || '')
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString()
    console.error(`[FRONTEND-CHAT] ${timestamp} | ERROR | ${message}`, error || '')
  }
}

interface UploadedFile {
  file: File
  id: string
  preview?: string
}

interface ChatInputBarProps {
  onSendMessage?: (message: string, files?: UploadedFile[]) => void
  placeholder?: string
  initialValue?: string
}

export default function ChatInputBar({ 
  onSendMessage, 
  placeholder = 'How can CURA help you today?',
  initialValue = ''
}: ChatInputBarProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)
      }
    }

    if (showModelDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showModelDropdown])

  const handleSend = () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return

    log.info('Sending message', {
      messageLength: inputValue.length,
      fileCount: uploadedFiles.length,
      fileNames: uploadedFiles.map(f => f.file.name),
      fileSizes: uploadedFiles.map(f => f.file.size)
    })

    if (onSendMessage) {
      onSendMessage(inputValue, uploadedFiles)
      setInputValue('')
      setUploadedFiles([])
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      log.info('Files selected via input', {
        fileCount: files.length,
        files: Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }))
      })
      handleFilesAdded(Array.from(files))
    }
  }

  const handleFilesAdded = async (files: File[]) => {
    log.info('Processing uploaded files', {
      totalFiles: files.length,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
    })
    
    setIsUploading(true)
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    const validFiles = files.filter(file => {
      const isValidType = validTypes.includes(file.type)
      const isValidSize = file.size <= maxSize
      
      if (!isValidType) {
        log.error('Invalid file type rejected', { fileName: file.name, fileType: file.type })
      }
      if (!isValidSize) {
        log.error('File too large rejected', { fileName: file.name, fileSize: file.size, maxSize })
      }
      
      return isValidType && isValidSize
    })
    
    log.info('File validation complete', {
      totalFiles: files.length,
      validFiles: validFiles.length,
      rejectedFiles: files.length - validFiles.length
    })

    const newUploadedFiles: UploadedFile[] = []
    for (const file of validFiles) {
      const id = Math.random().toString(36).substring(7)
      let preview = undefined
      
      if (file.type.startsWith('image/')) {
        try {
          preview = URL.createObjectURL(file)
          log.info('Generated preview for image', { fileName: file.name })
        } catch (error) {
          log.error('Failed to generate preview', { fileName: file.name, error })
        }
      }
      
      newUploadedFiles.push({ file, id, preview })
    }

    setUploadedFiles(prev => {
      const updated = [...prev, ...newUploadedFiles]
      log.info('Updated file list', {
        previousCount: prev.length,
        newCount: updated.length,
        addedFiles: newUploadedFiles.map(f => f.file.name)
      })
      return updated
    })
    setIsUploading(false)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        log.info('Removing file', { fileName: fileToRemove.file.name, fileId: id })
        if (fileToRemove.preview) {
          URL.revokeObjectURL(fileToRemove.preview)
        }
      }
      const updated = prev.filter(f => f.id !== id)
      log.info('File list updated after removal', {
        previousCount: prev.length,
        newCount: updated.length
      })
      return updated
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      log.info('Files dropped', {
        fileCount: e.dataTransfer.files.length,
        files: Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size, type: f.type }))
      })
      handleFilesAdded(Array.from(e.dataTransfer.files))
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* File Upload Area */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 bg-[#1f2228] border border-white/10 rounded-lg"
        >
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                {uploadedFile.preview ? (
                  <img src={uploadedFile.preview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                ) : (
                  <FileText size={16} className="text-white/60" />
                )}
                <span className="text-sm text-white/80 max-w-32 truncate">
                  {uploadedFile.file.name}
                </span>
                <button
                  onClick={() => removeFile(uploadedFile.id)}
                  className="text-white/40 hover:text-white/60 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Input Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="relative"
      >
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={`relative ${dragActive ? 'ring-2 ring-[#00AEEF]/50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full px-6 py-4 pr-32 rounded-xl bg-[#111513]/60 backdrop-blur-sm border border-[#1E3028] text-white placeholder-[#B7C4B8] focus:outline-none focus:border-[#00A86B]/50 transition-all duration-300 text-base font-normal"
            style={{
              boxShadow: isFocused 
                ? '0 4px 20px rgba(0,168,107,0.2)' 
                : '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          />
          
          {/* Right side icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-white/40 hover:text-white/60 transition-colors"
              title="Attach file"
              disabled={isUploading}
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
            {(inputValue.trim() || uploadedFiles.length > 0) && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleSend}
                className="p-2 text-[#00A86B] hover:text-[#88C999] transition-colors"
                title="Send message"
              >
                <Send size={18} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Row: Model Selection & Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 px-2 gap-3 md:gap-0"
      >
        {/* Left: Model Selection */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-2 text-[#B7C4B8] hover:text-white hover:border-[#00A86B]/40 text-xs md:text-sm font-medium transition-all duration-300 px-3 py-1.5 rounded border border-[#1E3028] hover:bg-[#00A86B]/5"
              style={{ fontWeight: 500 }}
            >
              <span>CURA 3.5 Smart</span>
              <Lock size={12} className="text-[#B7C4B8]/60" />
              <ChevronDown size={14} className={`text-[#B7C4B8]/60 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown (simplified - can be enhanced) */}
            {showModelDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 left-0 bg-[#111513]/95 backdrop-blur-md border border-[#1E3028] rounded-lg p-2 min-w-[200px] shadow-xl z-50"
              >
                <button 
                  onClick={() => setShowModelDropdown(false)}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-[#00A86B]/10 hover:text-white rounded transition-colors"
                >
                  CURA 3.5 Smart
                </button>
                <button 
                  onClick={() => setShowModelDropdown(false)}
                  className="w-full text-left px-3 py-2 text-sm text-[#B7C4B8] hover:bg-[#00A86B]/10 hover:text-white rounded transition-colors"
                >
                  CURA 4.0 Pro
                </button>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#111513]/60 border border-[#1E3028]">
            <span className="text-xs text-[#B7C4B8]">Formal</span>
            <ChevronDown size={12} className="text-[#B7C4B8]/60" />
          </div>
        </div>

        {/* Right: Hints */}
        <div className="flex items-center gap-4 text-xs text-[#B7C4B8]">
          <span className="hidden sm:inline">Use shift + return for new line</span>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="text-xs text-[#B7C4B8]/60 mt-3 text-center"
      >
        CURA can make mistakes. Please verify results.
      </motion.p>
    </div>
  )
}

