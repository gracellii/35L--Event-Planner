import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../useAuth.js';

// Wrap routes that need a logged-in user. Logged-out visitors go to /login,
// and come back to the page they wanted after logging in.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="center muted" style={{ padding: 48 }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// The opposite: /login and /register bounce logged-in users to the dashboard.
export function GuestOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p className="center muted" style={{ padding: 48 }}>Loading…</p>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
