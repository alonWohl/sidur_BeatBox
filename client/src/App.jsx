import { Routes, Route, Navigate } from 'react-router'
import { Header } from './components/Header'
import { Login } from './pages/Login'
import { EmployeesPage } from './pages/EmployeesPage'
import { SchedulePage } from './pages/SchedulePage'
import { AdminPage } from './pages/AdminPage'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { Footer } from './components/Footer'
import { useRef } from 'react'
import { useElementHeight } from './hooks/useElementHeight'

function App() {
  const { user } = useSelector((storeState) => storeState.userModule)
  const headerRef = useRef(null)
  const footerRef = useRef(null)

  const headerHeight = useElementHeight(headerRef)
  const footerHeight = useElementHeight(footerRef)

  const mainHeight = `calc(100vh - ${headerHeight + footerHeight}px)`

  return (
    <div className="h-screen w-full bg-neutral-50">
      <Header ref={headerRef} />
      <main style={{ height: mainHeight }} className="transition-height duration-200">
        <Routes>
          {!user && <Route path="/" element={<Navigate to="/login" />} />}
          {!user && <Route path="/login" element={<Login />} />}
          {user && <Route path="/schedule/" element={<SchedulePage />} />}
          {user && <Route path="/employee" element={<EmployeesPage />} />}
          {user && <Route path="/" element={<Navigate to={`/schedule/`} />} />}
        </Routes>
      </main>

      <Footer ref={footerRef} />
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
