export const CATEGORY_LABELS: Record<string, string> = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
  predictive: 'Preditiva',
  improvement: 'Melhoria',
  technical_visit: 'Visita Técnica',
}

export const CATEGORY_OPTIONS = [
  'Corretiva',
  'Preventiva',
  'Preditiva',
  'Melhoria',
  'Visita Técnica',
]

export function categoriaFromType(type?: string | null): string {
  if (type && CATEGORY_LABELS[type]) return CATEGORY_LABELS[type]
  return 'Corretiva'
}

export function typeFromCategoria(categoria?: string | null): string {
  switch (categoria) {
    case 'Preventiva':
      return 'preventive'
    case 'Preditiva':
      return 'predictive'
    case 'Melhoria':
      return 'improvement'
    case 'Visita Técnica':
      return 'technical_visit'
    default:
      return 'corrective'
  }
}
