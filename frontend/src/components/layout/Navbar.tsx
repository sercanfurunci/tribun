import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { useLanguageStore, useT } from '../../store/language';
import { Icon, type IconName } from '../ui/Icon';

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { lang, toggle } = useLanguageStore();
  const t = useT();
  const navigate = useNavigate();

  const NAV_LINKS: { to: string; label: string; icon: IconName }[] = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: 'zap' },
    { to: '/matches', label: t('nav.matches'), icon: 'ball' },
    { to: '/standings', label: t('nav.standings'), icon: 'trophy' },
    { to: '/leagues', label: t('nav.leagues'), icon: 'medal' },
  ];

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(6,13,26,0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div
                className="size-9 rounded-xl flex items-center justify-center font-heading font-bold text-base text-white transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 0 16px rgba(22,163,74,0.45)',
                }}
              >
                T
              </div>
              <span className="font-heading font-bold text-base text-white tracking-tight">Tribün</span>
            </Link>

            {/* Desktop nav */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
                {NAV_LINKS.map(({ to, label, icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-green-600/15 text-green-400'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon name={icon} size={16} />
                    {label}
                  </NavLink>
                ))}
              </nav>
            )}

            {/* Right */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Lang toggle — compact on mobile */}
              <button
                onClick={toggle}
                aria-label="Toggle language"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold font-heading uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className={lang === 'tr' ? 'text-green-400' : ''}>TR</span>
                <span className="text-slate-700">/</span>
                <span className={lang === 'en' ? 'text-green-400' : ''}>EN</span>
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div
                      className="size-7 rounded-lg flex items-center justify-center text-xs font-bold text-white font-heading shrink-0"
                      style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                    >
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300 hidden lg:block font-medium truncate max-w-[100px]">
                      {user?.username}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden md:block text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/8"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all btn-glow"
                    style={{
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      border: '1px solid rgba(22,163,74,0.3)',
                    }}
                  >
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav — FLOATING PILL with margin from edges */}
      {isAuthenticated && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
          <nav
            className="pointer-events-auto mx-4 flex items-center rounded-2xl px-1 py-1"
            style={{
              background: 'rgba(8, 16, 32, 0.92)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 16px 48px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset',
            }}
          >
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-green-400 bg-green-600/12'
                      : 'text-slate-500 hover:text-slate-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      name={icon}
                      size={20}
                      style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.55))' } : undefined}
                    />
                    <span className="text-[9.5px] font-bold font-heading tracking-wide leading-none uppercase">
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
