import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-lg">
              <h1 className="text-xl font-bold text-red-600">Algo deu errado</h1>
              <p className="mt-2 text-gray-600">
                Ocorreu um erro inesperado. Tente recarregar a página.
              </p>
              <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-3 text-xs text-gray-800">
                {this.state.error?.message}
              </pre>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Recarregar
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
