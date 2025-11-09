'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface HomeGreetingProps {
  userName?: string
}

const greetings = [
  "Ready to uncover new market opportunities?",
  "Let's find your next property insight.",
  "Need help analyzing today's documents?",
]

export default function HomeGreeting({ userName = 'Jordan' }: HomeGreetingProps) {
  const [currentGreeting, setCurrentGreeting] = useState(0)
  
  // Get time of day for personalized greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Rotate greetings every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 mb-8 relative">
      {/* Glowing CURA Orb Container */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center mb-2">
        {/* Ambient Glow Aura behind orb */}
        <div 
          className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-green-500 rounded-full pointer-events-none"
          style={{
            opacity: 0.3,
            filter: 'blur(60px)',
          }}
        />

        {/* Glowing CURA Orb */}
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            rotate: [0, 360],
          }}
          transition={{ 
            scale: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          className="relative z-10 w-full h-full"
        >
          {/* Orb - Clean gradient circle */}
          <div 
            className="w-full h-full rounded-full bg-gradient-to-b from-green-400 via-green-500 to-green-200"
            style={{
              boxShadow: '0 0 40px rgba(34, 197, 94, 0.44), inset 0 0 20px rgba(255, 255, 255, 0.1)',
            }}
          />
        </motion.div>
      </div>

      {/* Greeting Text - No background, direct on dark page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center relative z-10"
        style={{ backgroundColor: 'transparent' }}
      >
        <h1 
          className="text-4xl md:text-5xl font-semibold text-white mb-3 px-4 tracking-tight" 
          style={{ fontWeight: 600, backgroundColor: 'transparent' }}
        >
          {getTimeGreeting()}, {userName}
        </h1>
        <div 
          className="h-7 flex items-center justify-center px-4"
          style={{ backgroundColor: 'transparent' }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={currentGreeting}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-lg text-[#B7C4B8]"
              style={{ fontWeight: 400, backgroundColor: 'transparent' }}
            >
              {greetings[currentGreeting]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

