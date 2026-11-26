import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../useAuth.js'

const loadingMessage = <p className="center muted page-loading">Loading...</p>

// Pages that need a logged-in user. Logged-out visitors go to /login and
// come back here after logging in.
export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return loadingMessage
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

// Log in / sign up pages: logged-in users go straight to the dashboard
export function GuestOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) return loadingMessage
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
