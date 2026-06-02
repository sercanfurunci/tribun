import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { to: '/matches', label: 'Matches', icon: '⚽' },
  { to: '/standings', label: 'Standings', icon: '🏆' },
  { to: '/leagues', label: 'Leagues', icon: '🏅' },
];

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(6, 13, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(22,163,74,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="size-9 rounded-xl flex items-center justify-center font-heading font-bold text-lg text-white transition-all duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 0 16px rgba(22,163,74,0.4)',
              }}
            >
              T
            </div>
            <span className="font-heading font-bold text-lg text-white tracking-tight">
              Tribün
            </span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-green-500/12 text-green-400 border border-green-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/6 transition-all"
                >
                  <div
                    className="size-7 rounded-lg flex items-center justify-center text-xs font-bold text-white font-heading shrink-0"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                  >
                    {user?.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300 hidden sm:block font-medium">
                    {user?.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/8"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all btn-glow"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', border: '1px solid rgba(22,163,74,0.3)' }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-white/5 px-2 py-1.5 flex gap-1">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-green-500/12 text-green-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              <span className="text-[10px] leading-none">{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
