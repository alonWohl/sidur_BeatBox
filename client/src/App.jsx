import { Routes, Route, Navigate } from 'react-router'
import { Header } from './components/Header'
import { Login } from './pages/Login'
import { EmployeesPage } from './pages/EmployeesPage'
import { SchedulePage } from './pages/SchedulePage'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { Footer } from './components/Footer'

function App() {
  const { user } = useSelector((storeState) => storeState.userModule)

  return (
    <div className="h-[100dvh] w-full bg-neutral-50 flex flex-col">
      <Header />
      <main className="h-[calc(100%-8rem)] overflow-hidden relative">
        <Routes>
          {!user && <Route path="/" element={<Navigate to="/login" />} />}
          {!user && <Route path="/login" element={<Login />} />}
          {user && <Route path="/schedule/" element={<SchedulePage />} />}
          {user && <Route path="/employee" element={<EmployeesPage />} />}
          {user && <Route path="/" element={<Navigate to={`/schedule/`} />} />}
        </Routes>
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
