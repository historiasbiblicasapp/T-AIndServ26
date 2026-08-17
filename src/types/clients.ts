export interface Client {
  id: string
  name: string
  cnpj?: string
  company?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  number?: string
  complement?: string
  neighborhood?: string
  phone?: string
  email?: string
  responsible?: string
  created_at: string
  updated_at: string
}

export interface BrazilianCity {
  id: string
  city_name: string
  state: string
  state_name: string
  ibge_code?: string
}
