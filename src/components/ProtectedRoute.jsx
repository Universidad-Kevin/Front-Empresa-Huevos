import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/" />

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute