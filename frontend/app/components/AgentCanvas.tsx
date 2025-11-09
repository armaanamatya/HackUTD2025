'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AgentCard, ResponseType } from '../types'
import PropertyGrid from './PropertyGrid'
import AnalyticsView from './AnalyticsView'
import DocumentInsights from './DocumentInsights'
import InsightSummaryDashboard from './InsightSummaryDashboard'

interface AgentCanvasProps {
  cards: AgentCard[]
  onCardRemove: (id: string) => void
}

function DemoButton({ query, onClick }: { query: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-blue-500 transition-colors shadow-sm group"
    >
      <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">"{query}"</span>
    </motion.button>
  )
}

export default function AgentCanvas({ cards, onCardRemove }: AgentCanvasProps) {
  const renderResponse = (card: AgentCard) => {
    // Map old types to new intent types
    const intentType = card.type === 'property' ? 'property_discovery' :
                      card.type === 'analytics' ? 'predictive_analytics' :
                      card.type === 'document' ? 'document_intelligence' :
                      card.type === 'insights' ? 'insight_summarizer' :
                      'smart_search'

    switch (intentType) {
      case 'property_discovery':
        return <PropertyGrid properties={card.data?.properties || []} filters={card.data?.filters} />
      case 'predictive_analytics':
        return <AnalyticsView metrics={card.data?.metrics || []} chartData={card.data?.chartData || []} chartType={card.data?.chartType} insights={card.data?.insights} />
      case 'document_intelligence':
        return <DocumentInsights documents={card.data?.documents || []} summary={card.data?.summary || {}} />
      case 'insight_summarizer':
        return <InsightSummaryDashboard kpis={card.data?.kpis || []} topInsights={card.data?.topInsights || []} recommendations={card.data?.recommendations || []} chartData={card.data?.chartData} />
      case 'smart_search':
      default:
        return (
          <div className="h-full w-full flex items-center justify-center p-8">
            <p className="text-[#C9E3D5] text-lg">View your conversation in the chat sidebar.</p>
          </div>
        )
    }
  }

  return (
    <div className="h-full overflow-hidden">
      {cards.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 border-2 border-blue-200 mx-auto mb-6 flex items-center justify-center shadow-lg"
            >
              <span className="text-4xl">✨</span>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">CURA Agent Canvas</h3>
            <p className="text-sm text-gray-600 mb-4">Ask me to search properties, analyze trends, or get market insights</p>
            <p className="text-xs text-gray-500 mb-6">I'll adapt my interface to match your needs</p>
            <div className="flex flex-wrap gap-3 justify-center max-w-3xl">
              <DemoButton query="show me properties" onClick={() => window.dispatchEvent(new CustomEvent('cura-query', { detail: 'show me properties' }))} />
              <DemoButton query="predict next quarter" onClick={() => window.dispatchEvent(new CustomEvent('cura-query', { detail: 'predict next quarter' }))} />
              <DemoButton query="compare portfolios" onClick={() => window.dispatchEvent(new CustomEvent('cura-query', { detail: 'compare portfolios by ROI' }))} />
              <DemoButton query="summarize insights" onClick={() => window.dispatchEvent(new CustomEvent('cura-query', { detail: 'summarize insights' }))} />
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="h-full">
          <AnimatePresence mode="wait">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25
                }}
                className="h-full"
              >
                {renderResponse(card)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
