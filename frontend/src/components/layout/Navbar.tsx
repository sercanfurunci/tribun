import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { useLanguageStore, useT } from '../../store/language';
import { Icon, type IconName } from '../ui/Icon';

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { lang, toggle } = useLanguageStore();
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_LINKS: { to: string; label: string; icon: IconName }[] = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: 'zap' },
    { to: '/matches', label: t('nav.matches'), icon: 'ball' },
    { to: '/standings', label: t('nav.standings'), icon: 'trophy' },
    { to: '/leagues', label: t('nav.leagues'), icon: 'medal' },
  ];

  function handleLogout() {
    clearAuth();
    navigate('/login');
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
            onClick={() => setMobileMenuOpen(true)}
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

      {isAuthenticated && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
          />
          <aside
            className="absolute left-0 top-0 h-full w-[86%] max-w-[320px] border-r border-white/8 bg-[#060D1A]/98 px-4 py-5 shadow-[20px_0_60px_-30px_rgba(0,0,0,0.8)]"
            style={{
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <Link to="/dashboard" className="flex items-center gap-2.5 px-1">
                  <div
                    className="size-9 rounded-xl flex items-center justify-center font-heading font-bold text-base text-white"
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      boxShadow: '0 0 16px rgba(22,163,74,0.45)',
                    }}
                  >
                    T
                  </div>
                  <span className="font-heading font-bold text-base text-white tracking-tight">Tribün</span>
                </Link>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={toggle}
                  aria-label="Toggle language"
                  className="inline-flex items-center gap-1 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <span className={lang === 'tr' ? 'text-green-400' : ''}>TR</span>
                  <span className="text-slate-700">/</span>
                  <span className={lang === 'en' ? 'text-green-400' : ''}>EN</span>
                </button>
                <span className="text-[10px] uppercase tracking-[0.28em] text-slate-600">{t('common.tagline')}</span>
              </div>

              <nav className="mt-6 flex flex-col gap-1">
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

              <div className="mt-auto space-y-3 pt-6">
                <div className="rounded-2xl border border-white/8 bg-[#0B1220] p-4">
                  <Link to="/profile" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-[#0B1220] px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-red-400"
                >
                  <Icon name="log-out" size={16} />
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside
        className="sticky top-0 hidden h-[calc(100vh-2rem)] shrink-0 border-r border-white/8 bg-[#060D1A]/95 px-4 py-6 lg:flex lg:flex-col"
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

        <div className="mt-6 rounded-2xl border border-white/8 bg-[#0B1220] px-3 py-3 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.75)]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-600">{t('common.language')}</span>
            <button
              onClick={toggle}
              aria-label="Toggle language"
              className="inline-flex items-center gap-1 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <span className={lang === 'tr' ? 'text-green-400' : ''}>TR</span>
              <span className="text-slate-700">/</span>
              <span className={lang === 'en' ? 'text-green-400' : ''}>EN</span>
            </button>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.26em] text-slate-700">{t('common.tagline')}</p>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
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

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-2xl border border-white/8 bg-[#0F172A] p-4 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.8)]">
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-[#0F172A] px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-red-400"
          >
            <Icon name="log-out" size={16} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

    </>
  );
}
