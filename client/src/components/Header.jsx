import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { logout } from '@/store/user.actions'

import { useNavigate } from 'react-router'
import { Button } from './ui/button'
import { forwardRef } from 'react'
import logo from '../assets/images/logo.webp'

export const Header = forwardRef((props, ref) => {
  const { user } = useSelector((storeState) => storeState.userModule)
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const brandLogo = 'https://res.cloudinary.com/dqfhbqcwv/image/upload/v1743384278/logo_ruqkfk.webp'

  return (
    <header ref={ref} className="bg-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to="/">
            <div className="logo max-w-[150px] sm:max-w-[200px]">
              <img src={brandLogo || logo} alt="Sidur BeatBox" className="mix-blend-multiply w-full" />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-2 sm:space-x-8 rtl:space-x-reverse">
            {user && (
              <>
                <Link
                  to="/employee"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  עובדים
                </Link>
                <Link
                  to={`/schedule/`}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  משמרות
                </Link>
              </>
            )}

            {/* User Section */}
            {user ? (
              <div className="flex items-center gap-4 border-r pr-4 mr-4 rtl:border-l rtl:pl-4 rtl:ml-4 rtl:border-r-0 rtl:pr-0">
                <div className="text-xs sm:text-sm">
                  <span className="text-gray-500">סניף: </span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  className="bg-[#BE202E] text-white hover:bg-[#BE202E]/80 cursor-pointer px-2 py-1 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-colors duration-200 ">
                  התנתק
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#BE202E] text-white hover:bg-[#BE202E]/80 cursor-pointer px-2 py-1 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-colors duration-200 ">
                התחברות
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'
