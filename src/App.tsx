import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './components/Dashboard'
import ChatbotPanel from './components/ChatbotPanel'
import Footer from './components/Footer'

interface Message {
  id: number
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
}

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'user',
      text: 'Summarize Dallas property trends this quarter.',
      timestamp: new Date(),
    },
    {
      id: 2,
      type: 'assistant',
      text: 'Dallas office assets up 11%. Energy inefficiency risk rising 6%. Suggest reviewing 3 leases expiring soon.',
      timestamp: new Date(),
    },
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Dashboard />
                <ChatbotPanel messages={chatMessages} setMessages={setChatMessages} />
              </motion.div>
            )}
            {activeView !== 'dashboard' && (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-cbre-gray-900 mb-2">
                    {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                  </h2>
                  <p className="text-cbre-gray-500">Coming soon...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
