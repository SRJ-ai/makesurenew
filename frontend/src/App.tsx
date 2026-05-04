import { Navigate, Route, Routes } from 'react-router-dom'
import { IS_DEMO } from './api/client'
import { useAuth } from './hooks/useAuth'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import RepoDetail from './pages/RepoDetail'

export default function App() {
  const { isAuthenticated } = useAuth()
  const authed = IS_DEMO || isAuthenticated

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/dashboard"
        element={authed ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/repos/:id"
        element={authed ? <RepoDetail /> : <Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={<Navigate to={authed ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}
