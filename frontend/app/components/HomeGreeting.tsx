'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface HomeGreetingProps {
  userName?: string
}

export default function HomeGreeting({ userName = 'Jordan' }: HomeGreetingProps) {
  // Get time of day for personalized greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex flex-col items-center gap-6 mb-8">
      {/* Glowing CURA Orb */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* Outer glow */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 40px rgba(0, 174, 239, 0.4)',
              '0 0 60px rgba(0, 174, 239, 0.6)',
              '0 0 40px rgba(0, 174, 239, 0.4)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(0, 174, 239, 0.6) 0%, transparent 70%)',
          }}
        />
        
        {/* Orb */}
        <div 
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(0, 174, 239, 1), rgba(0, 150, 200, 0.8))',
            boxShadow: '0 0 30px rgba(0, 174, 239, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)',
          }}
        >
          <Sparkles size={32} className="text-white" strokeWidth={2} />
        </div>
      </motion.div>

      {/* Greeting Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-semibold text-white mb-3 px-4" style={{ opacity: 0.95, fontWeight: 600 }}>
          {getTimeGreeting()}, {userName}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xl md:text-2xl font-medium text-white/80 px-4"
          style={{ fontWeight: 500 }}
        >
          Can I help you with anything?
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-xs md:text-sm text-white/60 mt-4 max-w-md mx-auto px-4 text-center"
        >
          Choose a prompt below or write your own to start chatting with CURA
        </motion.p>
      </motion.div>
    </div>
  )
}

