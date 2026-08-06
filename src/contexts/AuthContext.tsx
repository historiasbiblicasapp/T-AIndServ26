import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  full_name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('taservind-user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('taservind-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      if (email === 'admin@tindserv.com.br' && password === 'Admin@123') {
        const userData = { id: '1', email: 'admin@tindserv.com.br', full_name: 'Admin', role: 'admin' }
        localStorage.setItem('taservind-user', JSON.stringify(userData))
        setUser(userData)
        toast.success('Login realizado com sucesso')
        return true
      } else if (email === 'admin@admin.com.br' && password === 'info2013') {
        const userData = { id: '2', email: 'admin@admin.com.br', full_name: 'Admin 2', role: 'admin' }
        localStorage.setItem('taservind-user', JSON.stringify(userData))
        setUser(userData)
        toast.success('Login realizado com sucesso')
        return true
      } else {
        toast.error('Credenciais inválidas')
        return false
      }
    } catch {
      toast.error('Erro ao fazer login')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('taservind-user')
    setUser(null)
    toast.success('Logout realizado')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
