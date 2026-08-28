import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/services/supabase'

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
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapSupabaseUser(user: any): User | null {
  if (!user) return null

  return {
    id: user.id,
    email: user.email ?? '',
    full_name: user.user_metadata?.full_name ?? user.email ?? 'Usuário',
    role: user.user_metadata?.role ?? 'user',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Remove tokens locais de sessões corrompidas/expiradas sem depender da rede,
  // evitando que requisições sigam com um JWT inválido (causa de erros 401).
  const clearInvalidSession = async () => {
    try {
      await getSupabaseClient().auth.signOut({ scope: 'local' })
    } catch {
      // ignora: o objetivo é apenas limpar o estado local
    }
  }

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      try {
        const { data: { session }, error } = await getSupabaseClient().auth.getSession()
        if (error) throw error
        if (mounted) {
          setUser(session ? mapSupabaseUser(session.user) : null)
        }
      } catch (error) {
        console.error('Erro ao carregar sessão do Supabase:', error)
        await clearInvalidSession()
        if (mounted) setUser(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadSession()

    const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      const eventName = event as string
      if (eventName === 'TOKEN_REFRESH_FAILED' || eventName === 'SIGNED_OUT') {
        // Refresh falhou (token expirado/rede): limpa a sessão inválida
        void clearInvalidSession()
        setUser(null)
        return
      }
      setUser(session ? mapSupabaseUser(session.user) : null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password })
      if (error) throw error

      const userData = mapSupabaseUser(data.user)
      if (!userData) {
        toast.error('Não foi possível carregar o usuário autenticado')
        return false
      }

      setUser(userData)
      toast.success('Login realizado com sucesso')
      return true
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao fazer login')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await getSupabaseClient().auth.signOut()
      if (error) throw error
      setUser(null)
      toast.success('Logout realizado')
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao sair')
    }
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
