import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Tribün</span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/matches', label: 'Matches' },
                { to: '/standings', label: 'Standings' },
                { to: '/leagues', label: 'Leagues' },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="size-7 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white">
                    {user?.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300 hidden sm:block">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-400 hover:text-red-400 transition-colors px-2 py-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <div className="md:hidden border-t border-slate-800 px-4 py-2 flex gap-1">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/matches', label: 'Matches' },
            { to: '/standings', label: 'Standings' },
            { to: '/leagues', label: 'Leagues' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 text-center px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
