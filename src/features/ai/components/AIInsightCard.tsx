import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, AlertTriangle, Lightbulb, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { AIInsight } from '@/features/ai/types'

const ICONS: Record<string, React.ElementType> = {
  recurring_failure: AlertTriangle,
  maintenance_suggestion: Lightbulb,
  efficiency: TrendingUp,
  cost: DollarSign,
  planning: Calendar,
}

const VARIANT_MAP: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  recurring_failure: 'destructive',
  maintenance_suggestion: 'warning',
  efficiency: 'success',
  cost: 'secondary',
  planning: 'default',
}

interface AIInsightCardProps {
  insight: AIInsight
  onApply?: () => void
}

export default function AIInsightCard({ insight, onApply }: AIInsightCardProps) {
  const Icon = ICONS[insight.type] ?? Brain

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand/10 p-2 text-brand">
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">{insight.title}</CardTitle>
          </div>
          <Badge variant={VARIANT_MAP[insight.type] ?? 'default'}>
            {Math.round(insight.confidence * 100)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">{insight.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {new Date(insight.createdAt).toLocaleString('pt-BR')}
          </span>
          {onApply && (
            <Button size="sm" onClick={onApply}>
              Ver detalhes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
