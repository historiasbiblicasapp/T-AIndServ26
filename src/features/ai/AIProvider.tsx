import { createContext, useContext, ReactNode } from 'react'
import { useAI } from '@/features/ai/hooks/useAI'

interface AIContextValue {
  insights: ReturnType<typeof useAI>['insights']
  suggestions: ReturnType<typeof useAI>['suggestions']
  chatMessages: ReturnType<typeof useAI>['chatMessages']
  isLoading: boolean
  runAnalysis: ReturnType<typeof useAI>['runAnalysis']
  detectFailures: ReturnType<typeof useAI>['detectFailures']
  getMaintenanceSuggestion: ReturnType<typeof useAI>['getMaintenanceSuggestion']
  summarizeWorkOrder: ReturnType<typeof useAI>['summarizeWorkOrder']
  generateDescription: ReturnType<typeof useAI>['generateDescription']
  helpPlanning: ReturnType<typeof useAI>['helpPlanning']
  sendChatMessage: ReturnType<typeof useAI>['sendChatMessage']
  clearInsights: ReturnType<typeof useAI>['clearInsights']
  clearSuggestions: ReturnType<typeof useAI>['clearSuggestions']
  clearChat: ReturnType<typeof useAI>['clearChat']
}

const AIContext = createContext<AIContextValue | undefined>(undefined)

export function AIProvider({ children }: { children: ReactNode }) {
  const ai = useAI()

  return (
    <AIContext.Provider value={ai}>
      {children}
    </AIContext.Provider>
  )
}

export function useAIContext() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAIContext must be used within AIProvider')
  }
  return context
}
