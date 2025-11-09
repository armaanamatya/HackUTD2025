'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, LayoutDashboard, Lightbulb, FileText, TrendingUp } from 'lucide-react'
import { WorkspaceType } from '../lib/constants'

interface Tab {
  id: string
  type: WorkspaceType
  title: string
  icon: any
}

interface WorkspaceTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
}

const iconMap: Record<WorkspaceType, any> = {
  dashboard: LayoutDashboard,
  insights: Lightbulb,
  reports: FileText,
  predictions: TrendingUp,
  settings: LayoutDashboard,
}

export default function WorkspaceTabs({ tabs, activeTab, onTabClick, onTabClose }: WorkspaceTabsProps) {
  if (tabs.length === 0) return null

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-cbre-gray-200 bg-white/50 backdrop-blur-sm overflow-x-auto">
      <AnimatePresence mode="popLayout">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.type] || LayoutDashboard
          const isActive = tab.id === activeTab
          
          return (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              onClick={() => onTabClick(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all relative
                ${isActive 
                  ? 'bg-white text-cbre-green border-t-2 border-cbre-green' 
                  : 'text-cbre-gray-600 hover:text-cbre-gray-900 hover:bg-cbre-gray-50'
                }
              `}
            >
              <Icon size={16} />
              <span className="text-sm font-medium whitespace-nowrap">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTabClose(tab.id)
                  }}
                  className="ml-1 p-0.5 rounded hover:bg-cbre-gray-200 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cbre-green"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

