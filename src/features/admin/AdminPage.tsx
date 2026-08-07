import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Search, Edit, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  nome: string
  email: string
  perfil: 'admin' | 'supervisor' | 'tecnico' | 'visualizador'
  ativo: boolean
  ultimoAcesso: string
}

interface Role {
  id: string
  nome: string
  descricao: string
  permissoes: string[]
}

const INITIAL_USERS: User[] = [
  { id: '1', nome: 'Admin', email: 'admin@tindserv.com', perfil: 'admin', ativo: true, ultimoAcesso: '2025-01-15' },
  { id: '2', nome: 'Maria Souza', email: 'maria@tindserv.com', perfil: 'supervisor', ativo: true, ultimoAcesso: '2025-01-14' },
  { id: '3', nome: 'João Silva', email: 'joao@tindserv.com', perfil: 'tecnico', ativo: true, ultimoAcesso: '2025-01-16' },
]

const ROLES: Role[] = [
  { id: '1', nome: 'admin', descricao: 'Acesso total', permissoes: ['all'] },
  { id: '2', nome: 'supervisor', descricao: 'Aprova e gerencia', permissoes: ['work-orders', 'reports', 'employees'] },
  { id: '3', nome: 'tecnico', descricao: 'Executa manutenções', permissoes: ['work-orders', 'equipment'] },
  { id: '4', nome: 'visualizador', descricao: 'Somente leitura', permissoes: ['dashboard', 'reports'] },
]

const PROFILE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  supervisor: 'bg-blue-100 text-blue-800',
  tecnico: 'bg-green-100 text-green-800',
  visualizador: 'bg-gray-100 text-gray-800',
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [roles] = useState<Role[]>(ROLES)
  const [search, setSearch] = useState('')
  const [profileFilter, setProfileFilter] = useState<string>('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<User>({ id: '', nome: '', email: '', perfil: 'tecnico', ativo: true, ultimoAcesso: '' })

  const filtered = users.filter(user => {
    if (search && !user.nome.toLowerCase().includes(search.toLowerCase()) && !user.email.toLowerCase().includes(search.toLowerCase())) return false
    if (profileFilter !== 'all' && user.perfil !== profileFilter) return false
    return true
  })

  const resetForm = () => {
    setForm({ id: '', nome: '', email: '', perfil: 'tecnico', ativo: true, ultimoAcesso: '' })
    setEditingId(null)
  }

  const handleSubmit = () => {
    if (!form.nome || !form.email) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (editingId) {
      setUsers(prev => prev.map(user => user.id === editingId ? { ...form, id: editingId } : user))
      toast.success('Usuário atualizado')
    } else {
      const newUser: User = { ...form, id: Date.now().toString(), ultimoAcesso: new Date().toISOString().split('T')[0] }
      setUsers(prev => [...prev, newUser])
      toast.success('Usuário criado')
    }

    setOpenDialog(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id))
    toast.success('Usuário removido')
  }

  const toggleActive = (id: string) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ativo: !user.ativo } : user))
    toast.success('Status atualizado')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
          <p className="mt-1 text-gray-600">Gerencie usuários e perfis de acesso.</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@tindserv.com" />
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={form.perfil} onValueChange={(value: User['perfil']) => setForm({ ...form, perfil: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => <SelectItem key={role.id} value={role.nome}>{role.descricao}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="ativo"
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="ativo">Usuário ativo</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={handleSubmit}>{editingId ? 'Salvar' : 'Criar'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Usuários</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-8 sm:w-64" />
              </div>
              <Select value={profileFilter} onValueChange={setProfileFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b">
                <tr>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Perfil</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Último Acesso</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-gray-500">Nenhum usuário encontrado</td></tr>
                ) : (
                  filtered.map(user => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{user.nome}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">
                        <Badge variant="secondary" className={PROFILE_COLORS[user.perfil]}>{user.perfil}</Badge>
                      </td>
                      <td className="py-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(user.id)}>
                          {user.ativo ? 'Ativo' : 'Inativo'}
                        </Button>
                      </td>
                      <td className="py-2">{user.ultimoAcesso}</td>
                      <td className="py-2">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setForm(user); setEditingId(user.id); setOpenDialog(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand" />
            <CardTitle>Perfis de Acesso</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map(role => (
              <div key={role.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">{role.nome}</h3>
                  <Badge variant="secondary">{role.permissoes.length}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500">{role.descricao}</p>
                <p className="mt-2 text-xs text-gray-400">Permissões: {role.permissoes.join(', ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
