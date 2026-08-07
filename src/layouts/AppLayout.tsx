import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Home,
} from 'lucide-react'
import { menuItems, bottomItems } from '@/config/routes'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { theme, toggleTheme } = useTheme()
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
    <div className="min-h-screen bg-green-600">
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-green-700 border-r border-green-800">
          <div className="flex h-16 items-center justify-between px-4 border-b border-green-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-green-700 font-bold text-sm">T&A</div>
              <span className="text-lg font-bold text-white">T&A Serv Ind</span>
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
                      ? 'bg-white/20 text-white'
                      : 'text-green-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-green-800 p-4">
            <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:text-white hover:bg-white/10" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </aside>
      )}

      <div className={!isMobile ? 'lg:pl-64' : ''}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-green-700 border-b border-green-800 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
              </button>
            )}
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => navigate('/')}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-green-700 font-bold text-sm">T&amp;A</div>
              <h1 className="text-lg font-semibold text-white">Serv Ind</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10" onClick={() => navigate('/')}>
              <Home className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:text-white hover:bg-white/10"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-green-700 text-sm font-medium">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-white">{user?.full_name}</span>
                <ChevronDown className="h-4 w-4 text-white" />
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

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>

        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-green-800 bg-green-700">
            <div className="flex items-center justify-around">
              {bottomItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 py-2 px-2 text-xs transition-colors ${
                      isActive ? 'text-white' : 'text-green-100'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="leading-none">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
