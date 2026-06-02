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
      <header
        className="sticky top-0 z-40 lg:hidden"
        style={{
          background: 'rgba(6,13,26,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            className="inline-flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

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

          <div className="flex items-center gap-1.5 shrink-0">
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
            <button
              type="button"
              aria-label="Notifications"
              className="inline-flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <aside
        className="sticky top-0 hidden h-screen shrink-0 border-r border-white/8 bg-[#060D1A]/95 px-4 py-6 lg:flex lg:flex-col"
        style={{
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2">
          <div
            className="size-10 rounded-xl flex items-center justify-center font-heading font-bold text-lg text-white"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 0 18px rgba(22,163,74,0.45)',
            }}
          >
            T
          </div>
          <span className="font-heading text-lg font-bold text-white tracking-tight">Tribün</span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-600/12 text-green-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon name={icon} size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <Link to="/profile" className="flex items-center gap-3">
              <div
                className="size-10 rounded-xl flex items-center justify-center text-sm font-bold text-white font-heading shrink-0"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
                <p className="text-xs text-slate-500">{t('nav.profile')}</p>
              </div>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-red-400"
          >
            <Icon name="log-out" size={16} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav — FLOATING PILL with margin from edges */}
      {isAuthenticated && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none lg:hidden"
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
