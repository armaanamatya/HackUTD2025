'use client'

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Lightbulb, 
  FileText, 
  TrendingUp, 
  Settings,
  BarChart3,
  Sparkles,
  Search,
  X
} from 'lucide-react'
import { WorkspaceType } from '../lib/constants'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectWorkspace: (workspace: WorkspaceType) => void
  onCommand: (command: string) => void
}

const commands = [
  {
    id: 'dashboard',
    label: 'Open Dashboard',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'home', 'main'],
    action: 'dashboard' as WorkspaceType,
  },
  {
    id: 'insights',
    label: 'Show Insights',
    icon: Lightbulb,
    keywords: ['insights', 'analysis', 'findings'],
    action: 'insights' as WorkspaceType,
  },
  {
    id: 'reports',
    label: 'Generate Report',
    icon: FileText,
    keywords: ['report', 'generate', 'export'],
    action: 'reports' as WorkspaceType,
  },
  {
    id: 'predictions',
    label: 'View Predictions',
    icon: TrendingUp,
    keywords: ['predict', 'forecast', 'future'],
    action: 'predictions' as WorkspaceType,
  },
  {
    id: 'visualize',
    label: 'Create Visualization',
    icon: BarChart3,
    keywords: ['visualize', 'chart', 'graph'],
    action: 'visualize',
  },
  {
    id: 'analyze',
    label: 'Run Analysis',
    icon: Sparkles,
    keywords: ['analyze', 'examine', 'evaluate'],
    action: 'analyze',
  },
]

export default function CommandPalette({ open, onOpenChange, onSelectWorkspace, onCommand }: CommandPaletteProps) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const handleSelect = (value: string) => {
    const command = commands.find(c => c.id === value)
    if (command) {
      if (command.action === 'visualize' || command.action === 'analyze') {
        onCommand(command.action)
      } else {
        onSelectWorkspace(command.action as WorkspaceType)
      }
      onOpenChange(false)
      setSearch('')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/4 -translate-x-1/2 z-50 w-full max-w-2xl"
          >
            <Command className="glass rounded-2xl border border-cbre-gray-200 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-cbre-gray-200 bg-white/80">
                <Search size={18} className="text-cbre-gray-400" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent outline-none text-cbre-gray-900 placeholder-cbre-gray-400"
                />
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1 rounded hover:bg-cbre-gray-100 transition-colors"
                >
                  <X size={16} className="text-cbre-gray-400" />
                </button>
              </div>
              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-cbre-gray-500">
                  No results found.
                </Command.Empty>
                {commands.map((command) => {
                  const Icon = command.icon
                  return (
                    <Command.Item
                      key={command.id}
                      value={command.id}
                      keywords={command.keywords}
                      onSelect={handleSelect}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer aria-selected:bg-cbre-green aria-selected:text-white transition-colors"
                    >
                      <Icon size={18} />
                      <span className="font-medium">{command.label}</span>
                    </Command.Item>
                  )
                })}
              </Command.List>
              <div className="px-4 py-2 border-t border-cbre-gray-200 bg-cbre-gray-50/50 text-xs text-cbre-gray-500 flex items-center justify-between">
                <span>Navigate with ↑↓</span>
                <span>Select with Enter</span>
                <span>Close with Esc</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

