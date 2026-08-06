import { NavLink } from 'react-router-dom'
import { bottomItems } from '@/config/routes'

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white lg:hidden">
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
    </nav>
  )
}
