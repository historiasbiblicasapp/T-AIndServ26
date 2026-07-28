import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('gmi_user')
    if (user) {
      window.location.href = '/'
    }
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    const email = (document.getElementById('email') as HTMLInputElement)?.value
    const password = (document.getElementById('password') as HTMLInputElement)?.value

    if (email === 'admin@tindserv.com.br' && password === 'Admin@123') {
      const userData = { id: '1', email: 'admin@tindserv.com.br', full_name: 'Admin', role: 'admin' }
      localStorage.setItem('gmi_user', JSON.stringify(userData))
      toast.success('Login realizado com sucesso')
      window.location.href = '/'
    } else if (email === 'admin@admin.com.br' && password === 'info2013') {
      const userData = { id: '2', email: 'admin@admin.com.br', full_name: 'Admin 2', role: 'admin' }
      localStorage.setItem('gmi_user', JSON.stringify(userData))
      toast.success('Login realizado com sucesso')
      window.location.href = '/'
    } else {
      toast.error('Credenciais inválidas')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="T&A" className="mx-auto mb-4 h-24 w-24 rounded-2xl object-cover" />
          <h1 className="text-3xl font-bold text-white">T&A</h1>
          <p className="text-blue-200">Gestão da Manutenção Industrial</p>
        </div>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <p className="text-sm text-muted-foreground">Acesse o sistema</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@tindserv.com.br" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="Senha" />
              </div>
              <Button className="w-full bg-brand hover:bg-blue-700" onClick={handleLogin} disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
