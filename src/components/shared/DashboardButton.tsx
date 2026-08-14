import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function DashboardButton() {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-white hover:text-white hover:bg-white/10"
      onClick={() => navigate('/')}
      title="Voltar para o Dashboard"
    >
      <Home className="h-5 w-5" />
    </Button>
  )
}
