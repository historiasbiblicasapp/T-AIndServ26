import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AIAssistant from '@/features/ai/components/AIAssistant'
import AIInsightCard from '@/features/ai/components/AIInsightCard'
import AISuggestionModal from '@/features/ai/components/AISuggestionModal'
import { useAIContext } from '@/features/ai/AIProvider'
import DashboardButton from '@/components/shared/DashboardButton'
import { Brain, RefreshCw, AlertTriangle, Lightbulb, MessageSquare } from 'lucide-react'
import { AISuggestion } from '@/features/ai/types'

export default function AIPage() {
  const {
    insights,
    suggestions,
    chatMessages,
    isLoading,
    runAnalysis,
    detectFailures,
    sendChatMessage,
    clearInsights,
    clearChat,
  } = useAIContext()

  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    setSelectedSuggestion(suggestion)
    setModalOpen(true)
  }

  const confirmSuggestion = () => {
    setModalOpen(false)
    alert('Ação confirmada pelo usuário. Em produção, aqui seria executada a ação sugerida.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assistente IA</h1>
          <p className="mt-1 text-gray-600">Análises, sugestões e assistência inteligente para manutenção.</p>
        </div>
        <div className="flex gap-2">
          <DashboardButton />
          <Button variant="outline" onClick={runAnalysis} disabled={isLoading}>
            <Brain className="mr-2 h-4 w-4" />
            Analisar histórico
          </Button>
          <Button variant="outline" onClick={detectFailures} disabled={isLoading}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Detectar falhas
          </Button>
          <Button variant="outline" onClick={() => clearInsights()} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
            {insights.length > 0 && <Badge variant="secondary">{insights.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Sugestões
            {suggestions.length > 0 && <Badge variant="secondary">{suggestions.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="chat">
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-gray-500">
                Nenhum insight gerado ainda. Clique em "Analisar histórico" ou "Detectar falhas" para começar.
              </CardContent>
            </Card>
          ) : (
            insights.map(insight => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-gray-500">
                Nenhuma sugestão pendente. Use as funcionalidades de IA para gerar sugestões.
              </CardContent>
            </Card>
          ) : (
            suggestions.map(suggestion => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{suggestion.title}</CardTitle>
                    <Badge variant={suggestion.risk === 'high' ? 'destructive' : suggestion.risk === 'medium' ? 'warning' : 'success'}>
                      Risco {suggestion.risk === 'high' ? 'Alto' : suggestion.risk === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                  <Button size="sm" onClick={() => handleApplySuggestion(suggestion)}>
                    Avaliar
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="chat">
          <AIAssistant
            messages={chatMessages}
            onSend={sendChatMessage}
            onClear={clearChat}
            title="Assistente de Manutenção"
          />
        </TabsContent>
      </Tabs>

      <AISuggestionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        suggestion={selectedSuggestion}
        onConfirm={confirmSuggestion}
        onReject={() => setModalOpen(false)}
      />
    </div>
  )
}
