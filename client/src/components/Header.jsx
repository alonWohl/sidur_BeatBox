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
    <header className="flex justify-between items-center p-4 border-b border-gray-200">
      <nav className="flex items-center gap-4">
        <Link to="/">ראשי</Link>
        {!user && <Link to="/login">התחברות</Link>}
        {user && <Link to="/worker">עובדים</Link>}
        {user && <Link to={`/schedule/${user._id}`}>סידור</Link>}
        {user && user.isAdmin && <Link to="/admin">סידור סניפים</Link>}
      </nav>

      {user && (
        <div className="flex flex-col items-center gap-2">
          <h2>
            יוזר מחובר : <span className="font-bold">{user.branch}</span>
          </h2>
          <Button onClick={handleLogout}>התנתק</Button>
        </div>
      )}

      <div className="logo w-[150px]">
        <img src={logo} alt="Sidur BeatBox" className="mix-blend-multiply" />
      </div>
    </header>
  )
}
