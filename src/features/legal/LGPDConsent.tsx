import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function LGPDConsent() {
  const [visible, setVisible] = useState(true)

  const handleAccept = () => {
    setVisible(false)
  }

  const handleReject = () => {
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-700">
            Utilizamos cookies e dados pessoais para melhorar sua experiência e garantir o funcionamento do sistema.
            Ao continuar navegando, você concorda com nossa{' '}
            <a href="/privacy" className="font-medium text-brand underline">Política de Privacidade</a> e{' '}
            <a href="/terms" className="font-medium text-brand underline">Termos de Uso</a>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleReject}>
            Recusar
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  )
}
