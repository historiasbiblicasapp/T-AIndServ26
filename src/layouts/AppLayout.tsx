import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  LogOut,
  Menu,
  X,
  Home,
  ChevronDown,
} from 'lucide-react'
import { menuItems, bottomItems } from '@/config/routes'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden print:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 print:hidden">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm">T&amp;A</div>
              <span className="text-lg font-bold text-gray-900">T&A Industrial Service</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {menuItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <Button variant="ghost" className="w-full justify-start gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
            <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500">
              <a href="/privacy" className="hover:text-gray-900">Política de Privacidade</a>
              <a href="/terms" className="hover:text-gray-900">Termos de Uso</a>
            </div>
          </div>
        </aside>
      )}

      <div className={!isMobile ? 'lg:pl-64 min-h-screen flex flex-col' : 'min-h-screen flex flex-col'}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 lg:px-6 print:hidden">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="h-6 w-6 text-gray-900" /> : <Menu className="h-6 w-6 text-gray-900" />}
              </button>
            )}
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => navigate('/')}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm">T&amp;A</div>
              <h1 className="text-lg font-semibold text-gray-900">Industrial Service</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100" onClick={() => navigate('/')}>
              <Home className="h-5 w-5" />
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-sm font-medium">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-900">{user?.full_name}</span>
                <ChevronDown className="h-4 w-4 text-gray-700" />
              </Button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>

        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white print:hidden">
            <div className="flex items-center justify-around">
              {bottomItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 py-2 px-2 text-xs transition-colors ${
                      isActive ? 'text-brand' : 'text-gray-500'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="leading-none">{item.label}</span>
                </NavLink>
              ))}
            </div>
            <div className="flex justify-center gap-4 border-t border-gray-200 py-2 text-[10px] text-gray-500">
              <a href="/privacy" className="hover:text-gray-900">Privacidade</a>
              <a href="/terms" className="hover:text-gray-900">Termos</a>
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
