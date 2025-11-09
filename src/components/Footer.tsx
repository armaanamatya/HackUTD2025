import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, FileText } from 'lucide-react'

const actionButtons = [
  { id: 'visualize', label: 'Visualize', icon: BarChart3 },
  { id: 'predict', label: 'Predict', icon: TrendingUp },
  { id: 'report', label: 'Generate Report', icon: FileText },
]

export default function Footer() {
  return (
    <motion.footer
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-6 py-4 border-t border-cbre-gray-200 bg-white/50 backdrop-blur-sm"
    >
      <div className="flex items-center justify-center gap-4">
        {actionButtons.map((button, index) => {
          const Icon = button.icon
          return (
            <motion.button
              key={button.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 30px rgba(0, 162, 90, 0.4)',
              }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-cbre-green/20 text-cbre-gray-700 font-medium hover:bg-cbre-green hover:text-white hover:border-cbre-green transition-all duration-300 shadow-glass"
            >
              <Icon size={18} />
              <span>{button.label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.footer>
  )
}

