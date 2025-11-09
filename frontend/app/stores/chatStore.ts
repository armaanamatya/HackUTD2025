import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatStore {
  messages: Message[]
  addMessage: (role: 'user' | 'assistant', content: string) => void
  clearChat: () => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isProcessing: false,
      
      addMessage: (role, content) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              role,
              content,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        })),
      
      clearChat: () => set({ messages: [] }),
      
      setIsProcessing: (processing) => set({ isProcessing: processing }),
    }),
    {
      name: 'cura-chat-storage',
    }
  )
)

