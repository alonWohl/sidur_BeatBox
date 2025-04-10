import { Link, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores/useUserStore'
import { useNavigate } from 'react-router'
import { Button } from './ui/button'
import { LogOut, Building2 } from 'lucide-react'
import { forwardRef } from 'react'
import logo from '../assets/images/logo.webp'

export const Header = forwardRef((props, ref) => {
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // פונקציה שבודקת אם הקישור פעיל
  const isActive = (path) => {
    return location.pathname.startsWith(path)
  }

  return (
    <header ref={ref} className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20 px-4 xl:px-6 2xl:px-0">
      <div className="max-w-[1900px] mx-auto">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center">
            <div className="h-8 sm:h-10 max-w-[120px] sm:max-w-[150px]">
              <img src={logo} alt="Sidur BeatBox" className="h-full object-contain" />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
            {user && (
              <>
                <Link
                  to="/employee"
                  className={`relative px-3 py-2 text-sm font-medium 
										${
                      isActive('/employee')
                        ? 'text-[#BE202E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#BE202E]'
                        : 'text-gray-700 hover:text-[#BE202E] hover:after:scale-x-100'
                    } 
										transition-colors duration-200 
										after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#BE202E] 
										${isActive('/employee') ? '' : 'after:scale-x-0'} 
										after:transition-transform after:origin-bottom-right`}>
                  עובדים
                </Link>
                <Link
                  to="/schedule"
                  className={`relative px-3 py-2 text-sm font-medium 
										${
                      isActive('/schedule')
                        ? 'text-[#BE202E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#BE202E]'
                        : 'text-gray-700 hover:text-[#BE202E] hover:after:scale-x-100'
                    } 
										transition-colors duration-200 
										after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#BE202E] 
										${isActive('/schedule') ? '' : 'after:scale-x-0'} 
										after:transition-transform after:origin-bottom-right`}>
                  משמרות
                </Link>
              </>
            )}

            {/* User Section */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4 border-r pr-3 sm:pr-4 mr-2 sm:mr-4 rtl:border-l rtl:pl-4 rtl:ml-4 rtl:border-r-0 rtl:pr-0">
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <Building2 className="w-3 h-3 text-gray-400 mr-1.5" />
                  <span className="text-xs text-gray-500 ml-0.5">סניף:</span>
                  <span className="text-xs font-medium text-gray-800 ml-1">{user.name}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-[#BE202E] hover:bg-gray-50 h-8 rounded-md px-2">
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-xs font-medium">התנתק</span>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-[#BE202E] text-white hover:bg-[#BE202E]/90 h-8 rounded-md" size="sm">
                  התחברות
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'
