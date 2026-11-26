import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth.js';
import { Logo } from './Icons.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onAuthPage = pathname === '/login' || pathname === '/register';

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true, state: { message: "You're logged out." } });
  }

  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      <header className={`topbar${onAuthPage ? ' bare' : ''}`}>
        <Link to={user ? '/dashboard' : '/login'} className="brand">
          <Logo />
          Event Planner
        </Link>

        {user ? (
          <nav className="topbar-right" aria-label="Account">
            <span className="who">
              <span className="avatar" aria-hidden="true">{initial}</span>
              {user.name || user.email}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          </nav>
        ) : pathname === '/register' ? (
          <Link to="/login" className="text-link">Log in</Link>
        ) : (
          <Link to="/register" className="text-link">Create an account</Link>
        )}
      </header>
      <Outlet />
    </>
  );
}
