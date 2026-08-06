export type AIInsightType = 'recurring_failure' | 'maintenance_suggestion' | 'efficiency' | 'cost' | 'planning'

export interface AIInsight {
  id: string
  type: AIInsightType
  title: string
  description: string
  confidence: number
  affectedIds: string[]
  createdAt: string
}

export interface AISuggestion {
  id: string
  insightId: string
  title: string
  description: string
  proposedAction: Record<string, unknown>
  risk: 'low' | 'medium' | 'high'
  createdAt: string
}

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AISummary {
  workOrderId: string
  summary: string
  keyPoints: string[]
  risks: string[]
  nextSteps: string[]
}
