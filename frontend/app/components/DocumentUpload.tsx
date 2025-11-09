'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText } from 'lucide-react'

interface DocumentUploadProps {
  onClose: () => void
}

export default function DocumentUpload({ onClose }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...prev, ...droppedFiles])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    // TODO: Implement actual upload logic
    console.log('Uploading files:', files)
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upload Documents</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload size={48} className={`mx-auto mb-4 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
            <p className="text-gray-700 mb-2">
              Drag and drop documents here, or{' '}
              <label className="text-emerald-600 cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </label>
            </p>
            <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, TXT files</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <FileText size={20} className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0}
              className="px-4 py-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload {files.length > 0 && `(${files.length})`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

