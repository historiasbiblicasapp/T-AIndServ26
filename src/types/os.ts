export interface Empresa {
  id: string
  nome: string
  nome_fantasia: string
  logo_url?: string
  cnpj?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  telefone?: string
  email?: string
}

export interface Cliente {
  id: string
  nome: string
  razao_social?: string
  nome_unidade?: string
  cnpj?: string
  empresa?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  numero?: string
  complemento?: string
  bairro?: string
  telefone?: string
  email?: string
  responsavel?: string
  created_at: string
  updated_at: string
}

export interface CategoriaServico {
  id: string
  nome: string
}

export interface OrdemServicoExecutante {
  id: string
  employee_id: string
  nome: string
  cpf?: string
  cargo?: string
  especialidade?: string
  setor?: string
  qualificacao?: string
}

export interface EscopoItem {
  id: string
  numero: number
  descricao: string
  pessoas: number
  horas: number
}

export interface Recurso {
  id: string
  descricao: string
  unidade: string
  quantidade: number
  valor_unitario: number
  valor_total: number
}

export interface Execucao {
  id: string
  status: string
  data_execucao?: string
  hora_inicial?: string
  hora_final?: string
  responsavel?: string
  observacoes: string
}

export interface Anexo {
  id: string
  nome: string
  url: string
  tipo: string
  categoria: 'antes' | 'durante' | 'depois' | 'documento' | 'outro'
  created_at: string
}

export interface Assinatura {
  id: string
  tipo: 'executante' | 'cliente'
  nome: string
  cpf?: string
  data?: string
  imagem?: string
}

export interface ChecklistItem {
  id: string
  texto: string
  checked: boolean
}

export interface OrdemServico {
  id: string
  numero: string
  empresa_id?: string
  cliente_id?: string
  cliente_nome?: string
  cliente_razao_social?: string
  cliente_unidade?: string
  cliente_cnpj?: string
  cliente_empresa?: string
  cliente_endereco?: string
  cliente_cidade?: string
  cliente_estado?: string
  cliente_cep?: string
  cliente_numero?: string
  cliente_complemento?: string
  cliente_bairro?: string
  cliente_telefone?: string
  cliente_email?: string
  cliente_responsavel?: string
  descricao: string
  categorias: string[]
  outras_categorias?: string
  executantes: OrdemServicoExecutante[]
  escopo: EscopoItem[]
  execucoes: Execucao[]
  recursos: Recurso[]
  anexos: Anexo[]
  assinaturas: Assinatura[]
  checklist: ChecklistItem[]
  status: 'aberta' | 'aguardando_execucao' | 'em_execucao' | 'aguardando_material' | 'concluida' | 'cancelada' | 'aprovada'
  data_emissao: string
  observacoes?: string
  created_at: string
  updated_at: string
  created_by?: string
  deleted_at?: string
}

export interface HistoricoOS {
  id: string
  ordem_servico_id: string
  user_id?: string
  user_nome?: string
  acao: string
  alteracoes?: string
  created_at: string
}

export interface OSFilter {
  numero?: string
  cliente?: string
  cnpj?: string
  data_inicial?: string
  data_final?: string
  status?: string
  categoria?: string
  executante?: string
  responsavel?: string
}
