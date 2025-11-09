export type AgentMode = 'analyze' | 'predict' | 'search' | 'summarize' | 'report'

export type ResponseType = 'property_discovery' | 'predictive_analytics' | 'smart_search' | 'document_intelligence' | 'insight_summarizer' | 'property' | 'analytics' | 'chat' | 'document' | 'insights'

export interface AgentCard {
  id: string
  type: ResponseType
  title: string
  content?: string
  data?: any
  timestamp: Date
}

export interface AgentResponse {
  type: ResponseType
  title: string
  content?: string
  data?: any
  insights?: any
}
