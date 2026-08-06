import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AISuggestion } from '@/features/ai/types'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface AISuggestionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestion: AISuggestion | null
  onConfirm: () => void
  onReject: () => void
}

export default function AISuggestionModal({ open, onOpenChange, suggestion, onConfirm, onReject }: AISuggestionModalProps) {
  if (!suggestion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sugestão da IA</DialogTitle>
          <DialogDescription>{suggestion.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant={suggestion.risk === 'high' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Risco: {suggestion.risk === 'high' ? 'Alto' : suggestion.risk === 'medium' ? 'Médio' : 'Baixo'}</AlertTitle>
            <AlertDescription>{suggestion.description}</AlertDescription>
          </Alert>

          <div className="rounded-md border p-3">
            <p className="text-sm font-medium">Ação proposta:</p>
            <pre className="mt-1 overflow-x-auto text-xs text-gray-600">
              {JSON.stringify(suggestion.proposedAction, null, 2)}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onReject}>
            <XCircle className="mr-2 h-4 w-4" />
            Rejeitar
          </Button>
          <Button onClick={onConfirm}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirmar e aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
