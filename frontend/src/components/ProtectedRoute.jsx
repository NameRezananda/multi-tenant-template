import { Navigate, useParams } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const { tenantDomain } = useParams()
  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    // If we are in a tenant path, redirect to that tenant's login
    const loginPath = tenantDomain ? `/${tenantDomain}/login` : '/login'
    return <Navigate to={loginPath} replace />
  }
  
  return children
}
