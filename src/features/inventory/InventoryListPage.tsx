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
import { Plus, Search, Edit, Trash2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { toast } from 'sonner'

interface InventoryItem {
  id: string
  codigo: string
  nome: string
  categoria: string
  quantidade: number
  unidade: string
  local: string
  estoqueMinimo: number
  ultimaMovimentacao: string
}

interface Movement {
  id: string
  itemId: string
  tipo: 'Entrada' | 'Saída'
  quantidade: number
  data: string
  responsavel: string
  observacao?: string
}

const INITIAL_ITEMS: InventoryItem[] = [
  { id: '1', codigo: 'P001', nome: 'Rolamento 6205', categoria: 'Peças', quantidade: 45, unidade: 'UN', local: 'Almoxarifado A', estoqueMinimo: 10, ultimaMovimentacao: '2025-01-15' },
  { id: '2', codigo: 'P002', nome: 'Filtro de óleo', categoria: 'Peças', quantidade: 8, unidade: 'UN', local: 'Almoxarifado A', estoqueMinimo: 15, ultimaMovimentacao: '2025-01-14' },
  { id: '3', codigo: 'I001', nome: 'Óleo lubrificante ISO 68', categoria: 'Insumos', quantidade: 120, unidade: 'L', local: 'Almoxarifado B', estoqueMinimo: 50, ultimaMovimentacao: '2025-01-16' },
]

const INITIAL_MOVEMENTS: Movement[] = [
  { id: '1', itemId: '1', tipo: 'Entrada', quantidade: 20, data: '2025-01-15', responsavel: 'João Silva', observacao: 'Compra NF-123' },
  { id: '2', itemId: '2', tipo: 'Saída', quantidade: 5, data: '2025-01-14', responsavel: 'Maria Souza', observacao: 'OS-045' },
]

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS)
  const [movements, setMovements] = useState<Movement[]>(INITIAL_MOVEMENTS)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [openItemDialog, setOpenItemDialog] = useState(false)
  const [openMovementDialog, setOpenMovementDialog] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState<InventoryItem>({ id: '', codigo: '', nome: '', categoria: '', quantidade: 0, unidade: 'UN', local: '', estoqueMinimo: 0, ultimaMovimentacao: '' })
  const [movementForm, setMovementForm] = useState<Movement>({ id: '', itemId: '', tipo: 'Entrada', quantidade: 0, data: '', responsavel: '', observacao: '' })

  const filteredItems = items.filter(item => {
    if (search && !item.nome.toLowerCase().includes(search.toLowerCase()) && !item.codigo.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== 'all' && item.categoria !== categoryFilter) return false
    return true
  })

  const resetItemForm = () => {
    setItemForm({ id: '', codigo: '', nome: '', categoria: '', quantidade: 0, unidade: 'UN', local: '', estoqueMinimo: 0, ultimaMovimentacao: '' })
    setEditingItemId(null)
  }

  const handleItemSubmit = () => {
    if (!itemForm.codigo || !itemForm.nome || !itemForm.local) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (editingItemId) {
      setItems(prev => prev.map(item => item.id === editingItemId ? { ...itemForm, id: editingItemId } : item))
      toast.success('Item atualizado')
    } else {
      const newItem: InventoryItem = { ...itemForm, id: Date.now().toString(), quantidade: itemForm.quantidade || 0, ultimaMovimentacao: new Date().toISOString().split('T')[0] }
      setItems(prev => [...prev, newItem])
      toast.success('Item criado')
    }

    setOpenItemDialog(false)
    resetItemForm()
  }

  const handleMovementSubmit = () => {
    if (!movementForm.itemId || !movementForm.responsavel || !movementForm.data || movementForm.quantidade <= 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const item = items.find(i => i.id === movementForm.itemId)
    if (!item) return

    if (movementForm.tipo === 'Saída' && item.quantidade < movementForm.quantidade) {
      toast.error('Quantidade insuficiente em estoque')
      return
    }

    const updatedQty = movementForm.tipo === 'Entrada' ? item.quantidade + movementForm.quantidade : item.quantidade - movementForm.quantidade
    setItems(prev => prev.map(i => i.id === movementForm.itemId ? { ...i, quantidade: updatedQty, ultimaMovimentacao: movementForm.data } : i))
    setMovements(prev => [...prev, { ...movementForm, id: Date.now().toString() }])
    toast.success('Movimentação registrada')
    setOpenMovementDialog(false)
    setMovementForm({ id: '', itemId: '', tipo: 'Entrada', quantidade: 0, data: '', responsavel: '', observacao: '' })
  }

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
    toast.success('Item removido')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="mt-1 text-gray-600">Gerencie itens, quantidades e movimentações.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={openMovementDialog} onOpenChange={setOpenMovementDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                {movementForm.tipo === 'Entrada' ? <ArrowDownToLine className="mr-2 h-4 w-4" /> : <ArrowUpFromLine className="mr-2 h-4 w-4" />}
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Item</Label>
                  <Select value={movementForm.itemId} onValueChange={value => setMovementForm({ ...movementForm, itemId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map(item => <SelectItem key={item.id} value={item.id}>{item.codigo} - {item.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={movementForm.tipo} onValueChange={(value: 'Entrada' | 'Saída') => setMovementForm({ ...movementForm, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrada">Entrada</SelectItem>
                        <SelectItem value="Saída">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input type="number" value={movementForm.quantidade} onChange={e => setMovementForm({ ...movementForm, quantidade: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={movementForm.data} onChange={e => setMovementForm({ ...movementForm, data: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input value={movementForm.responsavel} onChange={e => setMovementForm({ ...movementForm, responsavel: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Observação</Label>
                  <Input value={movementForm.observacao || ''} onChange={e => setMovementForm({ ...movementForm, observacao: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenMovementDialog(false)}>Cancelar</Button>
                <Button onClick={handleMovementSubmit}>Registrar</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openItemDialog} onOpenChange={setOpenItemDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetItemForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingItemId ? 'Editar Item' : 'Novo Item'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Código</Label>
                    <Input value={itemForm.codigo} onChange={e => setItemForm({ ...itemForm, codigo: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={itemForm.nome} onChange={e => setItemForm({ ...itemForm, nome: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input value={itemForm.categoria} onChange={e => setItemForm({ ...itemForm, categoria: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select value={itemForm.unidade} onValueChange={value => setItemForm({ ...itemForm, unidade: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">UN</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="KG">KG</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="CX">CX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input type="number" value={itemForm.quantidade} onChange={e => setItemForm({ ...itemForm, quantidade: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque Mínimo</Label>
                    <Input type="number" value={itemForm.estoqueMinimo} onChange={e => setItemForm({ ...itemForm, estoqueMinimo: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Local</Label>
                  <Input value={itemForm.local} onChange={e => setItemForm({ ...itemForm, local: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenItemDialog(false)}>Cancelar</Button>
                <Button onClick={handleItemSubmit}>{editingItemId ? 'Salvar' : 'Criar'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Itens em Estoque</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-8 sm:w-64" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Peças">Peças</SelectItem>
                  <SelectItem value="Insumos">Insumos</SelectItem>
                  <SelectItem value="Ferramentas">Ferramentas</SelectItem>
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
                  <th className="py-2">Código</th>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Categoria</th>
                  <th className="py-2">Qtd</th>
                  <th className="py-2">Un</th>
                  <th className="py-2">Local</th>
                  <th className="py-2">Mínimo</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr><td colSpan={8} className="py-6 text-center text-gray-500">Nenhum item encontrado</td></tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{item.codigo}</td>
                      <td className="py-2">{item.nome}</td>
                      <td className="py-2">{item.categoria}</td>
                      <td className="py-2">
                        <span className={item.quantidade <= item.estoqueMinimo ? 'font-bold text-red-600' : ''}>{item.quantidade}</span>
                      </td>
                      <td className="py-2">{item.unidade}</td>
                      <td className="py-2">{item.local}</td>
                      <td className="py-2">{item.estoqueMinimo}</td>
                      <td className="py-2">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setItemForm(item); setEditingItemId(item.id); setOpenItemDialog(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
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
          <CardTitle>Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b">
                <tr>
                  <th className="py-2">Data</th>
                  <th className="py-2">Item</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Qtd</th>
                  <th className="py-2">Responsável</th>
                  <th className="py-2">Obs</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-gray-500">Nenhuma movimentação</td></tr>
                ) : (
                  movements.slice().reverse().map(m => {
                    const item = items.find(i => i.id === m.itemId)
                    return (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="py-2">{m.data}</td>
                        <td className="py-2">{item?.codigo} - {item?.nome}</td>
                        <td className="py-2">
                          <Badge variant={m.tipo === 'Entrada' ? 'success' : 'destructive'}>{m.tipo}</Badge>
                        </td>
                        <td className="py-2">{m.quantidade}</td>
                        <td className="py-2">{m.responsavel}</td>
                        <td className="py-2 text-gray-500">{m.observacao}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
