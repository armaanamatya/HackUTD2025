'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, Lightbulb, FileText, TrendingUp, Settings } from 'lucide-react'
import { WorkspaceType } from '../lib/constants'

interface SidebarProps {
  activeView: WorkspaceType
  setActiveView: (view: WorkspaceType) => void
}

const menuItems = [
  { id: WorkspaceType.PROPERTY_DISCOVERY, label: 'Property Discovery', icon: LayoutDashboard },
  { id: WorkspaceType.INSIGHT_SUMMARIZER, label: 'Insights', icon: Lightbulb },
  { id: WorkspaceType.DOCUMENT_INTELLIGENCE, label: 'Documents', icon: FileText },
  { id: WorkspaceType.PREDICTIVE_ANALYTICS, label: 'Predictions', icon: TrendingUp },
  { id: WorkspaceType.SMART_SEARCH, label: 'Search', icon: Settings },
]

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 glass-dark border-r border-cbre-gray-200 flex flex-col p-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cbre-green">CURA</h1>
        <p className="text-xs text-cbre-gray-500 mt-1">Cursor for Real Estate</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-cbre-green text-white shadow-lg'
                  : 'text-cbre-gray-600 hover:bg-cbre-gray-100 hover:text-cbre-gray-900'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          )
        })}
      </nav>

      <div className="pt-6 border-t border-cbre-gray-200">
        <div className="text-xs text-cbre-gray-400">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-cbre-green animate-pulse"></div>
            <span>AI Agent Active</span>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

