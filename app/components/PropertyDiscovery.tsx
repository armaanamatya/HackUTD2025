'use client'

import ChatPanel from './ChatPanel'
import PropertyGrid from './PropertyGrid'
import { useState } from 'react'

interface PropertyDiscoveryProps {
  data: any
}

export default function PropertyDiscovery({ data }: PropertyDiscoveryProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const properties = data?.properties || []
  const filters = data?.filters || {}

  const handleSendMessage = async (message: string) => {
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <div className="h-full flex bg-[#F9FAFB]">
      {/* Left: Chat Panel */}
      <ChatPanel onSendMessage={handleSendMessage} isProcessing={isProcessing} />
      
      {/* Center + Right: Property Grid with Details Panel */}
      <PropertyGrid properties={properties} filters={filters} />
    </div>
  )
}
