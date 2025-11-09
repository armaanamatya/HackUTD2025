import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, User, Circle } from 'lucide-react'

export default function TopBar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass border-b border-cbre-gray-200 px-8 py-4 flex items-center justify-between"
    >
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative">
          <motion.div
            animate={{
              boxShadow: isSearchFocused
                ? '0 0 0 2px rgba(0, 162, 90, 0.4), 0 0 30px rgba(0, 162, 90, 0.3)'
                : '0 0 0 1px rgba(0, 162, 90, 0.2), 0 0 20px rgba(0, 162, 90, 0.15)',
            }}
            className="absolute inset-0 rounded-xl pointer-events-none"
          />
          <div className="relative flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-xl border border-cbre-green/20">
            <Search size={20} className="text-cbre-gray-400" />
            <input
              type="text"
              placeholder="Ask CURA anything…"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="flex-1 bg-transparent outline-none text-cbre-gray-700 placeholder-cbre-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cbre-green/10">
          <Circle size={8} className="fill-cbre-green text-cbre-green" />
          <span className="text-xs font-medium text-cbre-green">Online</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full bg-cbre-gray-100 flex items-center justify-center hover:bg-cbre-gray-200 transition-colors"
        >
          <User size={20} className="text-cbre-gray-600" />
        </motion.button>
      </div>
    </motion.header>
  )
}

