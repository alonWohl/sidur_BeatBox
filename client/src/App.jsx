import { Routes, Route, Navigate } from 'react-router'
import { Header } from './components/Header'
import { Login } from './pages/Login'
import { WorkersPage } from './pages/WorkersPage'
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
          {user && <Route path="/worker" element={<WorkersPage />} />}
          {user && <Route path="/schedule/:branchName" element={<SchedulePage />} />}
          {user && <Route path="/" element={<Navigate to={`/schedule/${user?.username}`} />} />}
          {/* <Route path="/admin" element={<AdminPage />} /> */}
        </Routes>
      </main>
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
