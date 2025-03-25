import logo from '../assets/images/logo.webp'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { logout } from '@/store/user.actions'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'

export function Header() {
  const { user } = useSelector((storeState) => storeState.userModule)
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="logo w-[150px]">
            <img src={logo} alt="Sidur BeatBox" className="mix-blend-multiply" />
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-8 rtl:space-x-reverse">
            {user && (
              <Link
                to="/worker"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                עובדים
              </Link>
            )}
            <Link
              to={`/schedule/${user?.username}`}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              משמרות
            </Link>
            {user?.username === 'moked' && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                ניהול
              </Link>
            )}

            {/* User Section */}
            {user ? (
              <div className="flex items-center gap-4 border-r pr-4 mr-4 rtl:border-l rtl:pl-4 rtl:ml-4 rtl:border-r-0 rtl:pr-0">
                <div className="text-sm">
                  <span className="text-gray-500">סניף: </span>
                  <span className="font-medium text-gray-900">{user.branch}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-[#BE202E] text-white hover:bg-[#BE202E]/80 cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  התנתק
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#BE202E] text-white hover:bg-[#BE202E]/80 cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                התחברות
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
