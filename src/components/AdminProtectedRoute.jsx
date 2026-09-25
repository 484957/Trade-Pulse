import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminProtectedRoute({ children }) {
  const { user, ready } = useAdminAuth()

  if (!ready) {
    return <div className="loading-state">Checking session...</div>
  }

  if (!user || !user.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
