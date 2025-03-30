import { Routes, Route, Navigate } from 'react-router'
import { Header } from './components/Header'
import { Login } from './pages/Login'
import { EmployeesPage } from './pages/EmployeesPage'
import { SchedulePage } from './pages/SchedulePage'
import { AdminPage } from './pages/AdminPage'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
function App() {
  const { user } = useSelector((storeState) => storeState.userModule)

  return (
    <div className="h-screen w-full bg-neutral-50">
      <Header />
      <main className="h-[calc(100vh-178px)]">
        <Routes>
          {!user && <Route path="/" element={<Navigate to="/login" />} />}
          {!user && <Route path="/login" element={<Login />} />}
          {user && <Route path="/schedule/" element={<SchedulePage />} />}
          {user && <Route path="/employee" element={<EmployeesPage />} />}
          {user && <Route path="/" element={<Navigate to={`/schedule/`} />} />}
        </Routes>
      </main>
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
